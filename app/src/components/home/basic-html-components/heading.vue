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
    id: {
        type: String,
        required: false,
    }
});

const headingId = computed(() => {
    if (props.id) {
        return props.id;
    } else {
        return props.value.toLowerCase().replaceAll(' ', '-');
    }
});

</script>
