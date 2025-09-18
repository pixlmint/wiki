<template>
    <img :src="url" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useWikiStore } from '@/src/stores/wiki';

const props = defineProps<{ el: HTMLImageElement }>();

const wikiStore = useWikiStore();

const domain = wikiStore.getEntryDomain(location.pathname);

const _url = document.createElement('a');
_url.href = props.el.src;

const url = computed(() => {    
    return (typeof domain !== 'undefined' ? domain : '') + _url.pathname;
});
</script>
