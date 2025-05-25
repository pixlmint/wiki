<template>
    <component :is="props.tag" :id="headingId">{{ props.value }}</component>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
    tag: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
});

const headingId = computed(() => {
    return props.value.toLowerCase().replaceAll(' ', '-');
});

</script>
