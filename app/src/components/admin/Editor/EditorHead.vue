<template>
    <div>
        <el-row justify="space-between" align="middle">
            <el-row align="middle" :gutter="20" class="editor-header">
                <el-col :span="2">
                    <el-button circle @click="checkGoHome">
                        <pm-icon icon="caret-left"></pm-icon>
                    </el-button>
                </el-col>
                <!--<el-col :span="22">
                    TODO: fix renaming
                    <input class="title-editor" @change="rename" :value="title"/>
                </el-col>-->
                <el-col :span="22">
                    <h1>{{ title }}</h1>
                </el-col>
            </el-row>
        </el-row>
        <p class="last-edited">
            {{ lastSavedFormatted }}
        </p>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {useWikiStore} from '@/stores/wiki';
import {ArrowLeft} from "@element-plus/icons-vue";
import {useMainStore} from "@/stores/main";
import {ElMessageBox} from "element-plus";
import {useDialogStore} from "pixlcms-wrapper";
import {navigate} from "@/helpers/navigator";

export default defineComponent({
    name: "EditorHead",
    components: {
        ArrowLeft,
    },
    data() {
        return {
            mainStore: useMainStore(),
            wikiStore: useWikiStore(),
            dialogStore: useDialogStore(),
            now: new Date(),
            interval: -1,
        }
    },
    computed: {
        title() {
            return useWikiStore().currentEntry?.meta.title;
        },
        lastSavedFormatted() {
            setTimeout(this.updateNow, 5000);
            let lastSaved = useWikiStore().editor.lastSaved;
            if (!lastSaved) {
                lastSaved = new Date();
            }
            const diffInSeconds = Math.floor((this.now.getTime() - lastSaved.getTime()) / 1000);

            if (diffInSeconds <= 10) {
                return 'Saved Just Now';
            } else if (diffInSeconds < 60) {
                return `Saved ${diffInSeconds} seconds ago`;
            } else {
                const diffInMinutes = Math.floor(diffInSeconds / 60);
                let mins = 'minutes'
                if (diffInMinutes === 1) {
                    mins = 'minute';
                }
                return `Saved ${diffInMinutes} ${mins} ago`;
            }
        },
    },
    methods: {
        save() {
            return useWikiStore().saveCurrentEntry()
        },
        rename(e: InputEvent) {
            const newTitle = e.target?.value;
            if (newTitle === null || newTitle === undefined) {
                return;
            }
            useWikiStore().renameEntry(newTitle).then(() => {
                useWikiStore().loadNav();
            })
        },
        checkGoHome() {
            if (this.mainStore.editingUnsavedChanges) {
                ElMessageBox.confirm('You\'ve got unsaved changes, are you sure you want to go back?', 'Unsaved Changes', {
                    type: 'warning',
                    cancelButtonText: 'Cancel',
                    confirmButtonText: 'Proceed'
                }).then(() => {
                    const ws = useWikiStore();
                    ws.fetchEntry(ws.safeCurrentEntry.id);
                    const id = ws.safeCurrentEntry.id;
                    navigate(id);
                }).catch(() => {
                })
            } else {
                const ws = useWikiStore();
                ws.fetchEntry(ws.safeCurrentEntry.id);
                const id = ws.safeCurrentEntry.id;
                navigate(id);
            }
        },
        updateNow() {
            this.now = new Date();
        }
    },
})
</script>

<style lang="scss" scoped>
.editor-header {
    padding: 0 1rem;
}

.title-editor {
    background-color: transparent;
}

p.last-edited {
    margin: unset;
    height: 10px;
    font-style: italic;
    color: var(--el-text-color-secondary);
    font-size: small;
}
</style>
