<template>
    <view-page>
        <template #heading>
            <EditorHead/>
        </template>
        <template #content>
        <div v-if="isEntryLoaded">
            <PDFEditor v-if="isPdf"></PDFEditor>
            <EditEntry v-else></EditEntry>
        </div>
        </template>
    </view-page>
</template>

<script lang="ts">
import EditEntry from "./EditEntry.vue";
import EditorHead from './EditorHead.vue';
import {defineComponent} from "vue";
import {useAuthStore} from 'pixlcms-wrapper'
import {useWikiStore} from "@/src/stores/wiki";
import {useMainStore} from "@/src/stores/main";
import PDFEditor from "@/src/components/admin/Editor/PDFEditor.vue";
import ViewPage from "@/src/components/pw/view-page.vue";

export default defineComponent({
    components: {
        PDFEditor,
        EditorHead,
        EditEntry,
        ViewPage,
    },
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
})
</script>