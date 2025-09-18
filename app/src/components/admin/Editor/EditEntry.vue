<template>
    <div>
        <div class="container">
            <pw-md-editor @refresh="refresh" :key="componentKey" @input="updateContent" @save="save"
                @change="updateContent" v-model="markdown" :editorHeight="editorHeight"></pw-md-editor>
        </div>
        <DrawModal v-if="isDrawing" @imagesave="imageSave"></DrawModal>
        <CurrentFileDiffModal v-if="isDiffing" @submitMerge="submitMerge" :key="diffKey"></CurrentFileDiffModal>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useWikiStore } from '@/src/stores/wiki'
import { useMainStore } from "@/src/stores/main";
import { useUserSettings } from "@/src/stores/user-settings";
import DrawModal from "@/src/components/admin/Editor/DrawModal.vue";
import CurrentFileDiffModal from "@/src/components/admin/Editor/CurrentFileDiffModal.vue";
import { useDialogStore } from "pixlcms-wrapper";
import { DateTime } from "luxon";


// TODO: use lastChanged to detect which version of the content is newer

let saveTimeout: number | null = null;

export default defineComponent({
    components: { DrawModal, CurrentFileDiffModal },
    data: function () {
        return {
            mainStore: useMainStore(),
            wikiStore: useWikiStore(),
            userSettings: useUserSettings(),
            dialogStore: useDialogStore(),
            componentKey: 0,
            diffKey: 0,
        }
    },
    created() {
        this.wikiStore.editor.lastSaved = new Date();
    },
    computed: {
        markdown: {
            get() {
                if (this.wikiStore.currentEntry === null) {
                    return '';
                }
                return this.wikiStore.currentEntry.raw_content;
            },
            set(newMarkdown: string) {
                this.wikiStore.currentEntry.raw_content = newMarkdown;
            }
        },
        isDrawing() {
            return this.dialogStore.isDialogShowing('/draw');
        },
        isDiffing() {
            return this.dialogStore.isDialogShowing('/diff');
        },
        editorHeight() {
            return window.innerHeight - 200 + 'px';
        }
    },
    methods: {
        submitMerge(d: any) {
            this.wikiStore.currentEntry.raw_content = d;
            this.wikiStore.currentEntry.meta.dateUpdated = DateTime.now().toFormat("yyyy-LL-dd HH:mm")
            this.wikiStore.saveCurrentEntry();
            this.dialogStore.hideDialog('/diff');
        },
        refresh() {
            this.wikiStore.fetchEntry(this.wikiStore.currentEntry.id);
            this.componentKey += 1;
        },
        updateContent(md: string) {
            if (!this.wikiStore.currentEntry) {
                console.error('Not editing an entry');
                return '';
            }
            this.mainStore.setHasUnsavedChanges(true);
            this.wikiStore.currentEntry.raw_content = md;

            if (this.userSettings.getSettings.autoSave && saveTimeout === null) {
                saveTimeout = window.setTimeout(() => {
                    saveTimeout = null;
                    this.save();
                }, 5000);
            }
        },
        imageSave(imgPath: string) {
            console.log("imageSave", imgPath);
        },
        showDiff() {
            this.diffKey += 1;
            this.dialogStore.showDialog('/diff');
        },
        save() {
            this.wikiStore.fetchLastChanged(this.wikiStore.currentEntry.id).then(lastChanged => {
                if (saveTimeout !== null) {
                    window.clearTimeout(saveTimeout);
                }
                const localLastChanged = new Date(this.wikiStore.currentEntry.meta.dateUpdated);
                if (localLastChanged < lastChanged) {
                    this.showDiff();
                } else {
                    this.mainStore.setHasUnsavedChanges(false);
                    return this.wikiStore.saveCurrentEntry();
                }
            });
        },
    },
})
</script>

<style scoped lang="scss">
.container {
    margin-top: 1rem;
}
</style>
