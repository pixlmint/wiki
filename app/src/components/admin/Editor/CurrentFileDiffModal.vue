<template>
    <pm-dialog :fullscreen="true" :route="route">
        <diff-editor @submit-merge="submitMerge" :modified-text="modifiedText"
            :original-text="originalText"></diff-editor>
    </pm-dialog>
</template>

<script setup lang="ts">
const emit = defineEmits({
    submitMerge: null,
});

const submitMerge = (merged: string) => {
    emit('submitMerge', merged);
}
</script>

<script lang="ts">
import { defineComponent } from "vue";
import { useDialogStore } from "pixlcms-wrapper";
import { useWikiStore } from "@/src/stores/wiki";
import DiffEditor from "@/src/components/pw/diff-editor.vue";

import 'diff2html/bundles/css/diff2html.min.css';

const route = "/diff";

export default defineComponent({
    name: "CurrentFileDiffModal",
    components: { DiffEditor },
    data() {
        return {
            dialogStore: useDialogStore(),
            wikiStore: useWikiStore(),
            originalText: '',
            diff: '',
            route: route,
        }
    },
    mounted() {
        this.wikiStore.loadEntry(this.wikiStore.currentEntry.id).then(c => {
            this.originalText = c;
        });
    },
    computed: {
        modifiedText() {
            return this.wikiStore.currentEntry.raw_content;
        },
    },
});
</script>
