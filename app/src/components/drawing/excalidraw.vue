<template>
    <el-button @click="exportDrawing">Export</el-button>
    <div :style="'width: ' + props.width + 'px; height: ' + props.height + 'px'">
        <ExcalidrawComponent :excalidrawAPI="onReady" :ref="onReady" :theme="theme" />
    </div>
    <svg ref="mycanvas"></svg>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { applyPureReactInVue } from 'veaury';
import { Excalidraw, exportToCanvas, exportToSvg } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { useUserSettings } from "@/src/stores/user-settings";

const props = defineProps({
    height: String,
    width: String,
});
const userSettings = useUserSettings();

const theme = computed(() => {
    return userSettings.getSettings.theme;
})

const emit = defineEmits(["save"])

const mycanvas = ref(null);

const exportDrawing = async function() {
    if (!excalidrawAPI) {
        return
    }
    const elements = excalidrawAPI.value.getSceneElements();
    if (!elements || !elements.length) {
        return
    }
    //const canvas = await exportToCanvas({
    //    elements,
    //    appState: {
    //        exportWithDarkMode: false,
    //    },
    //    files: excalidrawAPI.value.getFiles(),
    //    getDimensions: () => { return {width: 350, height: 350}}
    //});

    exportToSvg({
        elements,
        appState: {
            exportWithDarkMode: false,
        },
        files: excalidrawAPI.value.getFiles(),
    }).then((svg: HTMLSVGElement) => {
            emit("save", svg.outerHTML)
        });
}

const ExcalidrawComponent = applyPureReactInVue(Excalidraw);

const excalidrawAPI = ref<ExcalidrawImperativeAPI | null>(null);

const onReady = (api: ExcalidrawImperativeAPI) => {
    excalidrawAPI.value = api;
};
</script>

<style lang="scss" scoped>
// .excalidraw {
//     width: 100%;
//     height: 100%;
//
//     .el-dialog {
//         padding: 0;
//     }
// }
</style>


