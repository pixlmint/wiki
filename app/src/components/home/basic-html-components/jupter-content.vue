<template>
    <pw-view-page>
        <template #heading>
            <entry-heading :dropdownActions="IPYNB_ENTRY_ACTIONS"></entry-heading>
        </template>
        <template #content>
            <ActualHtmlContent :content="props.content"></ActualHtmlContent>
        </template>
    </pw-view-page>
</template>

<script lang="ts" setup>
import EntryHeading from "@/src/components/home/entry-heading.vue";
import ActualHtmlContent from "@/src/components/home/basic-html-components/actual-html-content.vue";
import { IPYNB_ENTRY_ACTIONS } from "@/src/helpers/entry-heading-dropdown-items";
import { useWikiStore } from '@/src/stores/wiki';
// import { ElMessage } from "element-plus";

// const wikiStore = useWikiStore();

const props = defineProps<{ content: string }>();

/*const dumpJupyter = function () {
    wikiStore.dumpAlternateContent(wikiStore.safeCurrentEntry.id).then(response => {
        ElMessage({
            message: 'Success',
        });
        wikiStore.fetchEntry(wikiStore.safeCurrentEntry.id);
    });
}*/
</script>
