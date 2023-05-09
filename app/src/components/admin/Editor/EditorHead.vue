<template>
    <div class="d-flex gap-1 editor-header ai_center">
        <el-button circle @click="checkGoHome">
            <el-icon>
                <arrow-left/>
            </el-icon>
        </el-button>
        <input class="title-editor" @change="rename" :value="title"/>
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
        }
    },
    computed: {
        title() {
            return useWikiStore().currentEntry?.meta.title;
        },
    },
    methods: {
        save() {
            return useWikiStore().saveEntry(useAuthStore().token)
        },
        rename(e: InputEvent) {
            const newTitle = e.target?.value;
            if (newTitle === null || newTitle === undefined) {
                return;
            }
            useWikiStore().renameEntry(newTitle, useAuthStore().token).then(() => {
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
                    const id = useWikiStore().currentEntry?.id;
                    this.router.push(id);
                }).catch(() => {
                })
            }
        },
    },
})
</script>

<style lang="scss" scoped>
.editor-header {
    padding: 0 1rem;
}
</style>