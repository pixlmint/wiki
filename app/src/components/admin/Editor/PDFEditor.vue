<template>
    <div>
        <p>Current PDF: {{ pdfPath }}</p>
        <input type="file" accept="application/pdf" ref="upload"/>
        <el-button @click="updatePdf" class="btn btn-primary">Update</el-button>
    </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {useWikiStore} from "@/src/stores/wiki";
import {ElNotification} from "element-plus";
import {buildRequest, send} from "pixlcms-wrapper";

export default defineComponent({
    name: 'PDFEditor',
    data() {
        return {
            wikiStore: useWikiStore(),
            file: ref('upload'),
        }
    },
    computed: {
        pdfPath() {
            return this.wikiStore.safeCurrentEntry.meta.pdf;
        }
    },
    methods: {
        updatePdf() {
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
            formData.append('entry', this.wikiStore.safeCurrentEntry.id);
            formData.append('meta', JSON.stringify(this.wikiStore.safeCurrentEntry.meta));
            formData.append('alternative_content', newFile);
            const request = buildRequest('/api/admin/entry/update-alternative-content', formData, 'POST');
            send(request);
        }
    },
})
</script>