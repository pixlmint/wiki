<template>
    <view-page>
        <template></template>
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import EditEntry from "./EditEntry.vue"
import EditorHead from './EditorHead.vue'
import { useAuthStore } from 'pixlcms-wrapper'
import { useWikiStore } from "@/stores/wiki"
import { useMainStore } from "@/stores/main"
import PDFEditor from "@/components/admin/Editor/PDFEditor.vue"
import ViewPage from "@/components/pw/view-page.vue"

const isEntryLoaded = ref(false)
const wikiStore = useWikiStore()
const mainStore = useMainStore()
const authStore = useAuthStore()

const isPdf = computed(() => {
    return 'renderer' in wikiStore.safeCurrentEntry.meta && 
        wikiStore.safeCurrentEntry.meta.renderer === 'pdf'
})

onMounted(async () => {
    if (!authStore.haveEditRights()) {
        throw new Error('You are not allowed to edit entries')
    }

    const params = new URLSearchParams(location.search)
    const entry = params.get('p') ?? ''

    await wikiStore.fetchEntry(entry)
    isEntryLoaded.value = true
    const title = `Edit ${wikiStore.safeCurrentEntry.meta.title}`
    mainStore.setTitle(title)
})
</script>
