<template>
    <div>
        <div class="container">
            <pw-md-editor @refresh="refresh" :key="componentKey" @input="updateContent" @save="save" @change="updateContent"
                          v-model="markdown" :editorHeight="editorHeight"></pw-md-editor>
        </div>
        <DrawModal v-if="isDrawing" @imagesave="imageSave"></DrawModal>
        <CurrentFileDiffModal v-if="isDiffing" @submitMerge="submitMerge" :key="diffKey"></CurrentFileDiffModal >
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useMainStore} from "@/src/stores/main";
import {useUserSettings} from "@/src/stores/user-settings";
import DrawModal from "@/src/components/admin/Editor/DrawModal.vue";
import CurrentFileDiffModal from "@/src/components/admin/Editor/CurrentFileDiffModal.vue";
import {useDialogStore} from "pixlcms-wrapper";
import {DateTime} from "luxon";


// TODO: use lastChanged to detect which version of the content is newer

let saveTimeout: number | null = null;

const isTimeoutSet = () => {
    return saveTimeout !== null;
}

export default defineComponent({
    components: {DrawModal, CurrentFileDiffModal},
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
                this.wikiStore.safeCurrentEntry.raw_content = newMarkdown;
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
            this.wikiStore.safeCurrentEntry.raw_content = d;
            this.wikiStore.safeCurrentEntry.meta.dateUpdated = DateTime.now().toFormat("yyyy-LL-dd HH:mm")
            this.wikiStore.saveCurrentEntry();
            this.dialogStore.hideDialog('/diff');
        },
        refresh() {
            this.wikiStore.fetchEntry(this.wikiStore.safeCurrentEntry.id);
            this.componentKey += 1;
            console.log("hello refresh");
        },
        updateContent(md: string) {
            if (!this.wikiStore.currentEntry) {
                console.error('Not editing an entry');
                return '';
            }
            this.mainStore.setHasUnsavedChanges(true);
            this.wikiStore.currentEntry.raw_content = md;

            if (this.userSettings.getSettings.autoSave && !isTimeoutSet()) {
                saveTimeout = window.setTimeout(() => {
                    saveTimeout = null;
                    this.save();
                }, 5000);
            }
        },
        imageSave(imgPath: string) {
            let md = this.wikiStore.safeCurrentEntry.raw_content;
            md += "![painting](" + imgPath + ")";
            this.wikiStore.safeCurrentEntry.raw_content = md;
            this.dialogStore.hideDialog('/draw');
            this.save();
        },
        showDiff() {
            this.diffKey += 1;
            this.dialogStore.showDialog('/diff');
        },
        save() {
            this.wikiStore.fetchLastChanged(this.wikiStore.safeCurrentEntry.id).then(lastChanged => {
                if (isTimeoutSet()) {
                    window.clearTimeout(saveTimeout);
                }
                const localLastChanged = new Date(this.wikiStore.safeCurrentEntry.meta.dateUpdated);
                if (localLastChanged < lastChanged) {
                    this.showDiff();
                } else {
                    this.mainStore.setHasUnsavedChanges(false);
                    return this.wikiStore.saveCurrentEntry();
                }
            });
        },
        checkGoHome() {
            /*if (this.mainStore.editingUnsavedChanges && confirm('You\'ve go unsaved changes. Save first?')) {
                this.save().then(() => {
                    this.doGoHome();
                });
            } else {
                this.doGoHome();
            }*/
        },
    },
})
</script>

<style scoped lang="scss">
.container {
    margin-top: 1rem;
}
</style>
