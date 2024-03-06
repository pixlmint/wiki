<template>
    <pm-dialog title="Board Settings" :route="route">
        <el-form :model="settings">
            <el-form-item label="Background">
                <el-upload :on-success="onSuccessUploading" action="/api/admin/gallery/upload" :headers="uploadHeaders"
                           :data="{gallery: currentBoardId}" accept="image/*" v-model:file-list="settings.background">
                    <el-button type="primary">
                        <pm-icon icon="upload" class="me-2"></pm-icon>
                        Click to Upload
                    </el-button>
                    <template #tip>
                        jpg/png files
                    </template>
                </el-upload>
            </el-form-item>
        </el-form>
    </pm-dialog>
</template>

<script lang="ts" setup>
import {reactive, computed} from "vue";
import {useBoardStore} from "@/src/stores/board";
import {useAuthStore} from "pixlcms-wrapper";
import {UploadFile, UploadFiles} from "element-plus";

interface UploadFileResponse {
    message: string,
    files: {
        path: string,
        scaled: { 100: string, 500: string, 1080: string, default: string },
    }[]
}

const boardStore = useBoardStore();
const authStore = useAuthStore();

const settings = reactive({
    background: [],
});

const currentBoardId = computed(() => {
    return boardStore.safeCurrentBoard.id;
});

const uploadHeaders = computed(() => {
    return {pixltoken: authStore.token};
});

const updateMetaValue = function (key: string, value: any) {
    const meta = boardStore.safeCurrentBoard.meta;
    meta.board[key] = value;
    return meta;
}

const onSuccessUploading = function (response: UploadFileResponse, uploadFile: UploadFile, uploadFiles: UploadFiles) {
    const backgroundPath = response.files[0].path;
    boardStore.updateBoardMeta(updateMetaValue('background', backgroundPath));
}
</script>

<script lang="ts">
import {defineComponent} from "vue";

export const route = "/board/settings";

export default defineComponent({
    name: 'BoardSettings',
});
</script>