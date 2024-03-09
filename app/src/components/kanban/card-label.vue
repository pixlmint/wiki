<template>
    <div class="card-label" :style="'background-color: ' + color + ';color: ' + fontColor">
        {{ props.label.title }}
    </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {hexToHsl} from "@/src/helpers/color";

const props = defineProps({
    label: {
        type: Object,
        required: true,
    }
});

const fontColor = computed(() => {
    const hsl = hexToHsl(props.label.color);
    if (hsl.l < 50) {
        return 'white';
    } else {
        return 'black';
    }
});

const color = computed(() => {
    return props.label.color;
});
</script>

<style lang="scss" scoped>
.card-label {
    padding: 3px 10px;
    border-radius: 17px;
    display: inline-block;
    margin: 1px;
}
</style>