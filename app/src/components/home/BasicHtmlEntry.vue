<template>
    <pw-view-page>
        <template #heading>
            <entry-heading>
            </entry-heading>
        </template>
        <template #content>
            <ActualHtmlContent :content="props.content"></ActualHtmlContent>
        </template>
    </pw-view-page>
</template>

<script lang="ts" setup>
import EntryHeading from "@/src/components/home/entry-heading.vue";
import ActualHtmlContent from "@/src/components/home/actual-html-content.vue";

const props = defineProps({
    content: {
        type: String,
        required: true,
    },
});
</script>
