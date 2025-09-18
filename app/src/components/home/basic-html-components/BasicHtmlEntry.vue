<template>
    <pw-view-page>
        <template #heading>
            <entry-heading :dropdownActions="PLAIN_ENTRY_ACTIONS"></entry-heading>
        </template>
        <template #content>
            <ActualHtmlContent :content="props.content"></ActualHtmlContent>
        </template>
    </pw-view-page>
</template>

<script lang="ts" setup>
import EntryHeading from "@/src/components/home/entry-heading.vue";
import ActualHtmlContent from "@/src/components/home/basic-html-components/actual-html-content.vue";
import { PLAIN_ENTRY_ACTIONS } from "@/src/helpers/entry-heading-dropdown-items";

const props = defineProps<{ content: string }>();
</script>
