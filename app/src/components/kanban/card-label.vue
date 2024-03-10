<template>
    <span class="card-label" :style="'border-color: ' + color + '; background-color: ' + backgroundColor + ';color: ' + fontColor">
        {{ props.label.title }}
    </span>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {hexToHsl} from "@/src/helpers/color";
import Color from 'colorjs.io';

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

const backgroundColor = computed(() => {
    const color = new Color(props.label.color);
    color.alpha = 0.25;
    return color.toString();
});

const color = computed(() => {
    return props.label.color;
});
</script>

<style lang="scss" scoped>
.card-label {
    padding: 1px 10px;
    border-radius: 100px;
    display: inline-block;
    margin: 1px;
    border: 1px solid black;
}
</style>