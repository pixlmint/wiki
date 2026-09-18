<template>
    <div class="notebook-container">
        <iframe ref="jupyterFrame" :src="notebookUrl" class="jupyter-iframe" />
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps<{ notebookUrl: string }>();
const jupyterFrame = ref();

const emit = defineEmits(['change']);

</script>

<style scoped>
.jupyter-iframe {
    width: 100%;
    height: 100vh;
    border: none;
}
</style>
