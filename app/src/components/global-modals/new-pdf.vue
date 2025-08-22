<template>
    <pm-dialog :title="meta.title" :route="route">
        <alternative-content-upload-form v-if="data.ready" :isInitialUpload="true" @afterSave="closeDialog"
            :entryId="data.entryId" :formData="data.formData">
        </alternative-content-upload-form>
    </pm-dialog>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive } from "vue";
import { useDialogStore } from "pixlcms-wrapper";
import AlternativeContentUploadForm from "@/src/components/forms/alternative-content-upload-form.vue";
import { AlternativeContentForm } from "@/src/helpers/alternativeContentHelper";

const route = '/nav/new-alternative-content';

const dialogStore = useDialogStore();

const meta = computed(() => dialogStore.getDialogData(route));

const data = reactive<{ formData: AlternativeContentForm | null, ready: boolean, entryId: string | null }>({
    formData: null,
    ready: false,
    entryId: null,
});

onMounted(() => {
    console.log(meta.value);
    data.formData = new AlternativeContentForm({
        renderer: meta.value.renderer,
        mime: meta.value.mime,
    });
    data.entryId = meta.value.id;
    data.ready = true;
});

onUnmounted(() => {
    data.ready = false;
})

const closeDialog = function () {
    dialogStore.hideDialog(route);
}
</script>

<script lang="ts">
export const route = '/nav/new-alternative-content';
</script>
