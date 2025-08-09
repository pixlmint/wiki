<template>
    <div>
        <p>Current PDF: {{ pdfPath }}</p>
        <alternative-content-upload-form
                v-if="data.ready"
                :isInitialUpload="false"
                :entryId="entry.id" ,
                :formData="data.formData"
                @afterSave="afterSave"
            >
        </alternative-content-upload-form>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { useWikiStore } from "@/src/stores/wiki";
import AlternativeContentUploadForm from "@/src/components/forms/alternative-content-upload-form.vue";
import { AlternativeContentForm } from "@/src/helpers/alternativeContentHelper";
import { ElNotification } from "element-plus";


const wikiStore = useWikiStore();
const entry = computed(() => wikiStore.safeCurrentEntry);
const pdfPath = computed(() => entry.value.meta.alternative_content);

const data = reactive<{ formData: AlternativeContentForm | null, ready: boolean }>({
    formData: null,
    ready: false,
});

onMounted(() => {
    data.formData = new AlternativeContentForm({
        renderer: 'pdf',
        title: entry.value.meta.title,
        mime: 'application/pdf'
    });
    data.ready = true;
})

const afterSave = function () {
    ElNotification({
        type: 'success',
        title: 'Success',
        message: 'Successfully updated',
    });
}

</script>
