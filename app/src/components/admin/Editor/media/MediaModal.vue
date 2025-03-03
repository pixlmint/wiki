<template>
    <pm-dialog :route="route" title="Select Media">
        <div v-for="(gall, index) in gallery" :key="index">
            <h2>{{ gall.name }}</h2>
            <div class="d-flex media-selector">
                <div class="selectable-media" v-for="(media, mediaIndex) in gall.media" :key="mediaIndex">
                    <div class="actual-media" v-if="gall.slug !== 'vid'" :style="`background-image: url('${media.default}?${(new Date()).toJSON()}`"></div>
                    <video class="actual-media" v-else :src="media.default + '?' + (new Date()).toJSON()"></video>
                    <div class="media-actions">
                        <el-button
                            v-if="gall.slug === 'svg'"
                            @click="editDrawing(media.default)"
                            round text>
                            <pm-icon icon="pen-ruler"></pm-icon>
                        </el-button>

                        <el-button round text @click="copyMedia(media)">
                            <pm-icon icon="copy"></pm-icon>
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
        <el-form>
            <el-upload
                v-model:file-list="fileList"
                :auto-upload="false"
                ref="uploadRef"
                multiple>
                <template #trigger>
                    <el-button type="primary">Select Files</el-button>
                </template>
                <el-button v-if="hasMediaToUpload" type="success" @click="uploadFiles">Upload</el-button>
            </el-upload>
        </el-form>
    </pm-dialog>
</template>

<script setup lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useDialogStore, useMediaStore, type MediaStore } from 'pixlcms-wrapper';
import { UploadInstance, UploadUserFile, ElMessage } from 'element-plus';
import { copyTextToClipboard } from '@/src/helpers/clipboard';
import { useWikiStore } from '@/src/stores/wiki';

const mediaStore: MediaStore = useMediaStore();
const dialogStore = useDialogStore();
const wikiStore = useWikiStore();

const gallery = computed(() => {
    return mediaStore.gallery;
});

const hasMediaToUpload = computed(() => {
    return fileList.value.length > 0;
});

const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadUserFile[]>([])

const uploadFiles = function() {
    let filesRemaining = fileList.value.length;
    for (const file of fileList.value) {
        const data = new FormData();
        data.append('gallery', wikiStore.safeCurrentEntry.id);
        // @ts-ignore
        data.append('files', file.raw);
        file.status = 'uploading';
        mediaStore.uploadMedia(data).then(() => {
            file.status = 'success';
            file.percentage = 100;
            filesRemaining--;
        }).catch((error: any) => {
                console.error(error);
                file.status = 'fail';
                filesRemaining--;
            });
    }

    const checkUploadsInterval = window.setInterval(() => {
        if (filesRemaining <= 0) {
            uploadRef.value!.clearFiles();
            window.clearInterval(checkUploadsInterval);
            mediaStore.loadMediaForEntry(wikiStore.safeCurrentEntry.id);
        } 
    }, 100);
}

const copyMedia = function(media: any) {
    const md = `![uploaded file](${encodeURI(media.default)})`;
    copyTextToClipboard(md).then(success => {
        const text = success ? 'Copied url to clipboard' : 'Error copying url to clipboard';
        const type = success ? 'success' : 'warning';
        ElMessage({
            message: text,
            type: type,
        });
    });
}

const editDrawing = function(media: string) {
    dialogStore.showDialog({route: "/draw", data: {media: media}});
}

</script>

<script lang="ts">
export const route = "/media";
export default defineComponent({
    name: "MediaModal",
});
</script>

<style lang="scss" scoped>
.media-selector {
    display: flex;
    gap: 2px;

    .selectable-media {
        position: relative;
        height: 150px;
        width: calc(25% - 2px * 4);

        .actual-media {
            background-size: cover;
            height: 100%;
            width: 100%;
            max-width: 100%;
            border-radius: 5px;
        }

        .media-actions {
            display: flex;
            justify-content: center;
            align-items: center;

            button {
                color: black;

                &:hover {
                    color: white;
                }
            }
        }
    }

    .media-actions {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
    }
}
</style>
