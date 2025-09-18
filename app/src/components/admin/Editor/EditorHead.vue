<template>
    <div>
        <el-row justify="space-between" align="middle" :gutter="20" class="editor-header">
            <el-col :span="2">
                <el-button circle @click="checkGoHome">
                    <pm-icon icon="caret-left"></pm-icon>
                </el-button>
            </el-col>
            <el-col :span="22">
                <h1>{{ title }}</h1>
            </el-col>
        </el-row>
        <p class="last-edited">
            {{ lastSavedFormatted }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useWikiStore } from '@/src/stores/wiki';
import { useMainStore } from "@/src/stores/main";
import { ElMessageBox } from "element-plus";
import { navigate } from "@/src/events";
import * as feService from "@/src/services/feService";

const emit = defineEmits(["editorClose"]);

const data = reactive({
    now: new Date(),
    interval: -1,
});

const mainStore = useMainStore();
const wikiStore = useWikiStore();

const title = computed(() => {
    return wikiStore.currentEntry?.meta.title;
});

const lastSavedFormatted = computed(() => {
    setTimeout(updateNow, 5000);
    let lastSaved = useWikiStore().editor.lastSaved;
    if (!lastSaved) {
        lastSaved = new Date();
    }
    const diffInSeconds = Math.floor((data.now.getTime() - lastSaved.getTime()) / 1000);

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
})

const updateNow = function () {
    data.now = new Date();
}

const checkGoHome = function () {
    if (mainStore.editingUnsavedChanges) {
        ElMessageBox.confirm('You\'ve got unsaved changes, are you sure you want to go back?', 'Unsaved Changes', {
            type: 'warning',
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Proceed'
        }).then(() => {
            // wikiStore.fetchEntry(wikiStore.currentEntry.id);
            // const id = wikiStore.currentEntry.id;
            emit('editorClose');
            feService.view(wikiStore.currentEntry!);
            // navigate(id);
        }).catch(() => {
        })
    } else {
        emit('editorClose');
        feService.view(wikiStore.currentEntry!);
    }
}
</script>

<style lang="scss" scoped>
.editor-header {
    padding: 0 1rem;
    min-height: 80px;
}

p.last-edited {
    margin: 0 0 10px 0;
    font-style: italic;
    color: var(--el-text-color-secondary);
    font-size: small;
}
</style>
