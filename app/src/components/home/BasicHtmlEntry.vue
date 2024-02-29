<template>
    <pw-view-page>
        <template #heading>
            <entry-heading>
            </entry-heading>
        </template>
        <template #content>
            <p v-html="content"></p>
        </template>
    </pw-view-page>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import EntryHeading from "@/src/components/home/entry-heading.vue";

export default defineComponent({
    name: "BasicHtmlEntry",
    components: {EntryHeading},
    props: ['content'],
})
</script>