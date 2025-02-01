<template>
    <template v-if="isInternalLink">
        <InternalLink :attrs="props.attrs" :content="content"></InternalLink>
    </template>
    <template v-else>
        <a v-bind="props.attrs" target="_blank">{{ content }}</a>
    </template>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import InternalLink from "@/components/home/basic-html-components/internal-link.vue";

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

const isInternalLink = computed(() => {
    return href.value.startsWith(location.origin);
});

const href = computed(() => {
    return props.attrs.href;
});
</script>
