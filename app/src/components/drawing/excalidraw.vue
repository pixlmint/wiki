<template>
    <div :style="'width: ' + props.width + 'px; height: ' + props.height + 'px'">
        <ExcalidrawComponent :excalidrawAPI="onReady" :ref="onReady" :theme="theme">
            <MainMenuComponent>
                <el-button @click="exportDrawing()" text><pm-icon icon="save" /><span>Save</span></el-button>
                <el-button @click="excalidrawAPI.refresh()" text><pm-icon icon="rotate"></pm-icon><span>Refresh</span></el-button>
                <el-button @click="storeLocally()" text><pm-icon icon="save" /><span>Cache</span></el-button>
                <el-button @click="restoreFromLocal" text><pm-icon icon="upload" /><span>Restore</span></el-button>
                <el-button @click="close" text><pm-icon icon="xmark" /><span>Close</span></el-button>
            </MainMenuComponent>
        </ExcalidrawComponent>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { applyPureReactInVue } from 'veaury';
import { Excalidraw, MainMenu, exportToSvg } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { useUserSettings } from "@/src/stores/user-settings";

const props = defineProps({
    height: String,
    width: String,
    data: Object,
});
const userSettings = useUserSettings();

const theme = computed(() => {
    return userSettings.getSettings.theme;
})

const emit = defineEmits(["save", "close"])

const storeLocally = function() {
    if (!excalidrawAPI) {
        return
    }
    const data = {
        elements: excalidrawAPI.value.getSceneElements(),
        appState: excalidrawAPI.value.getAppState()
    }
    localStorage.setItem("currentDrawing", JSON.stringify(data));
}

const restoreFromLocal = function() {
    const data = JSON.parse(localStorage.getItem("currentDrawing"));
    data.collaborators = [];
    excalidrawAPI.value.updateScene(data)
}

const exportDrawing = async function() {
    if (!excalidrawAPI) {
        return
    }
    const elements = excalidrawAPI.value.getSceneElements();
    if (!elements || !elements.length) {
        return
    }
    storeLocally();

    exportToSvg({
        elements,
        appState: {
            exportWithDarkMode: false,
        },
        files: excalidrawAPI.value.getFiles(),
    }).then((svg: SVGSVGElement) => {
            emit("save", svg.outerHTML, JSON.stringify({elements: elements, appstate: excalidrawAPI.value.getAppState()}));
        });
}

const close = function() {
    emit("close");
}

onMounted(() => {
    window.setTimeout(() => {
        if (props.data && Object.keys(props.data).length > 0) {
            excalidrawAPI.value.updateScene(props.data);
        }
        excalidrawAPI.value.refresh();
    }, 100);
});

const ExcalidrawComponent = applyPureReactInVue(Excalidraw);
const MainMenuComponent = applyPureReactInVue(MainMenu);

// @ts-ignore
const excalidrawAPI = ref<ExcalidrawImperativeAPI>(null);

const onReady = (api: ExcalidrawImperativeAPI) => {
    excalidrawAPI.value = api;
};
</script>


