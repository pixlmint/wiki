<template>
    <a @click="handleClick" v-bind="props.attrs">{{ content }}</a>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useWikiStore } from "@/src/stores/wiki";
import { navigate } from "@/src/events";

const props = defineProps({
    attrs: {
        type: Object,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});

const wikiStore = useWikiStore();
const linkUrl = props.attrs.href;

const entryId = computed(() => {
    const a = document.createElement('a');
    a.href = props.attrs.href;
    return a.pathname;
});

const handleClick = function (event: MouseEvent) {
    event.preventDefault();
    if (event.ctrlKey || event.shiftKey) {
        window.open(linkUrl);
    } else {
        wikiStore.fetchEntry(entryId.value);
        navigate(entryId.value);
    }
}
</script>
