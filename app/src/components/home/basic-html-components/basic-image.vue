<template>
    <img :src="url" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { getTheEntryId } from '@/src/services/feService';

const props = defineProps<{ el: HTMLImageElement }>();

const entryIdentifier = getTheEntryId(location.pathname);
const domain = entryIdentifier.domain;

const _url = document.createElement('a');
_url.href = props.el.src;

const url = computed(() => {    
    return (typeof domain !== 'undefined' ? domain : '') + _url.pathname;
});
</script>
