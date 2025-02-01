<pw-view-page>
    <template></template>
    <template #heading>
        <entry-heading>
        </entry-heading>
    </template>
    <template #content>
        <ActualHtmlContent :content="props.content"></ActualHtmlContent>
    </template>
</pw-view-page>

<script lang="ts" setup>
import EntryHeading from "@/components/home/entry-heading.vue";
import ActualHtmlContent from "@/components/home/basic-html-components/actual-html-content.vue";

const props = defineProps({
    content: {
        type: String,
        required: true,
    },
});
</script>
