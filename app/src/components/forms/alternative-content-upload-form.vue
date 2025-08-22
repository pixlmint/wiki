<template>
    <el-form onsubmit="return false">
        <slot name="form-base">
            <el-form-item>
                <el-input onsubmit="return false" v-model="fileTitle" type="text"
                    placeholder="New Entry Title" />
            </el-form-item>
            <el-form-item>
                <input ref="file" type="file" :accept="mime" />
            </el-form-item>
        </slot>
        <slot name="form-extra"></slot>
    </el-form>

    <el-button @click="save" type="primary">Save</el-button>
</template>

<script lang="ts" setup>
import { ElNotification } from 'element-plus';
import { send } from 'pixlcms-wrapper';
import { ref, toRefs, watch } from 'vue';
import { useWikiStore } from "@/src/stores/wiki";
import { AlternativeContentForm } from '@/src/helpers/alternativeContentHelper';

const emit = defineEmits(['beforeSave', 'afterSave']);

const wikiStore = useWikiStore();

const props = defineProps<{
    entryId: string,
    isInitialUpload: boolean,
    formData: AlternativeContentForm,
}>();

const file = ref(null);
const fileTitle = ref(props.formData.formData.title);
const mime = ref(props.formData.mime);

watch(fileTitle, (newFileTitle: string) => {
    setFormDataValue('title', newFileTitle);
});

const setFormDataValue = function (key: string, value: string) {
    props.formData.setValue(key, value);
}

const save = function () {
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
    const formData = props.formData;
    const newFile = files[0];

    let request;

    formData.setValue('alternative_content', newFile);

    if (props.isInitialUpload) {
        formData.setValue('parentFolder', props.entryId);
        request = formData.buildUploadForm();
    } else {
        const entry = wikiStore.getEntryById(props.entryId);
        entry.meta.title = fileTitle.value;
        formData.setValue('entry', entry.id);
        formData.setValue('meta', JSON.stringify(entry.meta))
        request = formData.buildUpdateForm();
    }

    emit('beforeSave', request);

    /** @ts-ignore */
    send(request).then((response) => {
        if (!response.data.success) {
            ElNotification({
                type: "error",
                title: "Error",
                message: "File was not able to upload",
            });
            return;
        }
        wikiStore.loadNav();

        emit('afterSave', response);
    });
}
</script>
