<template>
    <div>
        <div class="d-flex gap-1 editor-header ai_center">
            <el-button circle @click="checkGoHome">
                <el-icon>
                    <arrow-left/>
                </el-icon>
            </el-button>
            <input class="title-editor" @change="rename" :value="title"/>
        </div>
        <p class="last-edited">
            {{ lastSavedFormatted }}
        </p>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {useWikiStore} from '@/src/stores/wiki';
import {useAuthStore} from '@/src/stores/auth';
import {ArrowLeft} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {useMainStore} from "@/src/stores/main";
import {ElMessageBox} from "element-plus";

export default defineComponent({
    name: "EditorHead",
    components: {
        ArrowLeft,
    },
    data() {
        return {
            router: useRouter(),
            mainStore: useMainStore(),
            wikiStore: useWikiStore(),
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
            return useWikiStore().saveEntry()
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
                    const id = useWikiStore().safeCurrentEntry.id;
                    this.router.push(id);
                }).catch(() => {
                })
            } else {
                const id = useWikiStore().safeCurrentEntry.id;
                this.router.push(id);
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