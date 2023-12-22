<template>
    <div>
        <div class="container">
            <pw-md-editor @refresh="refresh" :key="componentKey" @input="updateContent" @save="save" @change="updateContent"
                          v-model="markdown"></pw-md-editor>
        </div>
        <DrawModal @imagesave="imageSave"></DrawModal>
        <CurrentFileDiffModal @submitMerge="submitMerge" :key="diffKey"></CurrentFileDiffModal >
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useRouter} from 'vue-router'
import {useMainStore} from "@/src/stores/main";
import {useUserSettings} from "@/src/stores/user-settings";
import DrawModal from "@/src/components/admin/Editor/DrawModal.vue";
import CurrentFileDiffModal from "@/src/components/admin/Editor/CurrentFileDiffModal.vue";
import {useDialogStore} from "@/src/stores/dialog";
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
    },
    methods: {
        submitMerge(d: any) {
            this.wikiStore.safeCurrentEntry.raw_content = d;
            this.wikiStore.safeCurrentEntry.meta.dateUpdated = DateTime.now().toFormat("yyyy-LL-dd HH:mm")
            this.wikiStore.saveEntry();
            this.dialogStore.clearShowingDialog();
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
                    this.save();
                    saveTimeout = null;
                }, 5000);
            }
        },
        imageSave(imgPath: string) {
            let imgUrl = location.protocol + "//" + location.hostname
            if (location.port !== "80" && location.port !== "443") {
                imgUrl += ":" + location.port;
            }
            imgUrl += imgPath;
            let md = this.wikiStore.safeCurrentEntry.raw_content;
            md += "![painting](" + imgUrl + ")";
            this.wikiStore.safeCurrentEntry.raw_content = md;
            this.dialogStore.clearShowingDialog();
            this.save();
        },
        showDiff() {
            this.diffKey += 1;
            this.dialogStore.showDialog('/diff');
        },
        save() {
            this.wikiStore.fetchLastChanged(this.wikiStore.safeCurrentEntry.id).then(lastChanged => {
                const localLastChanged = new Date(this.wikiStore.safeCurrentEntry.meta.dateUpdated);
                if (localLastChanged < lastChanged) {
                    this.showDiff();
                } else {
                    this.mainStore.setHasUnsavedChanges(false);
                    return this.wikiStore.saveEntry();
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
        doGoHome() {
            useRouter().push('/');
        }
    },
})
</script>

<style scoped lang="scss">
.container {
    margin-top: 1rem;
}
</style>