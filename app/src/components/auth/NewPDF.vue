<template>
    <pm-dialog title="New PDF" :route="route">
        <el-form>
            <el-form-item>
                <input @change="updateTitle" type="text" placeholder="New Entry Title"/>
            </el-form-item>
            <el-form-item>
                <input ref="upload" type="file" accept="application/pdf"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="uploadPdf" type="primary" class="btn btn-primary">Upload</el-button>
        </template>
    </pm-dialog>
</template>

<script lang="ts">

import {defineComponent, ref} from "vue";
import {useDialogStore, buildRequest, send} from "pixlcms-wrapper";
import {ElNotification} from "element-plus";
import {useWikiStore} from "@/src/stores/wiki";

export const route = '/nav/new-pdf';

export default defineComponent({
    props: ['parentFolder'],
    data() {
        return {
            dialogStore: useDialogStore(),
            wikiStore: useWikiStore(),
            title: '',
            file: ref('upload'),
            route: route,
        }
    },
    methods: {
        uploadPdf() {
            const uploadField = this.$refs['upload'] as HTMLInputElement
            const files = uploadField.files as FileList;
            if (files.length === 0) {
                ElNotification({
                    type: "error",
                    title: "Error",
                    message: "Please select a file to upload",
                });
                return;
            }
            const newFile = files[0];
            const formData = new FormData();
            formData.append('title', this.title);
            formData.append('renderer', 'pdf');
            formData.append('parentFolder', this.dialogStore.getDialogData(this.route));
            formData.append('alternative_content', newFile);
            const request = buildRequest('/api/admin/entry/upload-alternative-content', formData, 'POST');
            send(request).then((response: Response) => {
                if (!response.data.success) {
                    ElNotification({
                        type: "error",
                        title: "Error",
                        message: "File was not able to upload",
                    });
                }
                this.wikiStore.loadNav();
                this.dialogStore.hideDialog(this.route);
                // this.router.push(response.data.id);
            });
        },
        updateTitle(event: Event) {
            this.title = event.target.value;
        },
    },
})
</script>