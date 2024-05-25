<template>
    <pm-dialog title="New PDF" :route="route">
        <el-form onsubmit="return false">
            <el-form-item>
                <el-input onsubmit="return false" v-model="pdfTitle" type="text" placeholder="New Entry Title"/>
            </el-form-item>
            <el-form-item>
                <input ref="file" type="file" accept="application/pdf"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="uploadPdf" type="primary" class="btn btn-primary">Upload</el-button>
        </template>
    </pm-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import {useDialogStore, buildRequest, send} from "pixlcms-wrapper";
import {ElNotification} from "element-plus";
import {useWikiStore} from "@/src/stores/wiki";

const route = '/nav/new-pdf';

const dialogStore = useDialogStore();
const wikiStore = useWikiStore();

const pdfTitle = ref('');
const file = ref(null);

const uploadPdf = function () {
    const uploadField = file.value;
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
    formData.append('title', pdfTitle.value);
    formData.append('renderer', 'pdf');
    formData.append('parentFolder', dialogStore.getDialogData(route));
    formData.append('alternative_content', newFile);
    const request = buildRequest('/api/admin/entry/upload-alternative-content', formData, 'POST');
    send(request).then((response) => {
        if (!response.data.success) {
            ElNotification({
                type: "error",
                title: "Error",
                message: "File was not able to upload",
            });
        }
        wikiStore.loadNav();
        dialogStore.hideDialog(route);
    });
}
</script>

<script lang="ts">
export const route = "/nav/new-pdf";
</script>
