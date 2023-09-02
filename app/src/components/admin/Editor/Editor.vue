<template>
    <div>
        <EditorHead/>
        <div v-if="isEntryLoaded">
            <PDFEditor v-if="isPdf"></PDFEditor>
            <EditEntry v-else></EditEntry>
        </div>
    </div>
</template>

<script lang="ts">
import EditEntry from "./EditEntry.vue";
import EditorHead from './EditorHead.vue';
import {defineComponent} from "vue";
import {useAuthStore} from '@/src/stores/auth'
import {useWikiStore} from "@/src/stores/wiki";
import {useMainStore} from "@/src/stores/main";
import PDFEditor from "@/src/components/admin/Editor/PDFEditor.vue";

export default defineComponent({
    data: function () {
        return {
            isEntryLoaded: false,
            wikiStore: useWikiStore(),
            title: "Edit " + this.entry,
        }
    },
    computed: {
        isPdf() {
            if (!('renderer' in this.wikiStore.safeCurrentEntry.meta)) {
                return false;
            }
            return 'pdf' === this.wikiStore.safeCurrentEntry.meta.renderer;
        },
    },
    created() {
        if (!useAuthStore().haveEditRights()) {
            throw new Error('You are not allowed to edit entries');
        }
        let entry = new URLSearchParams(location.search).get('p');
        if (entry === null) {
            entry = '';
        }
        this.wikiStore.fetchEntry(entry).then(() => {
            this.isEntryLoaded = true;
            this.title = "Edit " + this.wikiStore.safeCurrentEntry.meta.title;
            useMainStore().setTitle(this.title)
        });
    },
    components: {
        PDFEditor,
        EditorHead,
        EditEntry,
    },
})
</script>