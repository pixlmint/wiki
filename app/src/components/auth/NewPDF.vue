<template>
    <el-dialog title="New PDF" v-model="isShowing">
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
    </el-dialog>
</template>

<script lang="ts">

import {defineComponent, ref} from "vue";
import {useDialogStore} from "@/src/stores/dialog";
import {buildRequest, send} from "@/src/helpers/xhr";
import {ElNotification} from "element-plus";
import {useWikiStore} from "@/src/stores/wiki";
import {useRouter} from "vue-router";

const route = '/nav/new-pdf';

export default defineComponent({
    props: ['parentFolder'],
    data() {
        return {
            dialogStore: useDialogStore(),
            wikiStore: useWikiStore(),
            router: useRouter(),
            title: '',
            file: ref('upload'),
        }
    },
    computed: {
        isShowing: {
            get() {
                return route === this.dialogStore.getShowingDialog;
            },
            set() {
                this.dialogStore.clearShowingDialog();
            }
        },
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
            formData.append('parentFolder', this.dialogStore.safePdfParentFolder);
            formData.append('alternative_content', newFile);
            const request = buildRequest('/api/admin/entry/upload-alternative-content', formData, 'POST');
            send(request).then(response => {
                this.wikiStore.loadNav();
                this.dialogStore.clearShowingDialog();
                this.router.push(response.data.id);
            });
        },
        updateTitle(event: Event) {
            this.title = event.target.value;
        },
    },
})
</script>