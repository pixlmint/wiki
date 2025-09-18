<template>
    <pm-dialog class="drawing-dialog" style="padding: 0" :fullscreen="true" :show-close="false" :route="route">
        <!--<d3-canvas @save="save" :width="width" :height="height"></d3-canvas>-->
        <ExcalidrawWrapper v-if="isReady" :data="drawingData" @save="save" @close="close" :width="width" :height="height"/>
    </pm-dialog>
</template>

<script lang="ts">
import {useWikiStore} from "@/src/stores/wiki";
// import {Drawing} from "@/src/contracts/Canvas";
import {useDialogStore, buildRequest, send} from "pixlcms-wrapper";
// import D3Canvas from "@/src/components/drawing/d3canvas.vue";
import ExcalidrawWrapper from "@/src/components/drawing/excalidraw.vue";
import {computed, defineComponent, onMounted, ref} from "vue";
import { ElMessage } from "element-plus";

export const route = '/draw';

export default defineComponent({
    name: "DrawModal",
    components: {
        // D3Canvas,
        ExcalidrawWrapper,
    },
    setup(props, {emit}) {
        const dialogStore = useDialogStore();
        const wikiStore = useWikiStore();

        const width = computed(() => {
            return (window.innerWidth).toString();
        });

        const height = computed(() => {
            return (window.innerHeight - 20).toString();
        });

        const drawingData = ref({});
        const isReady = ref(false);
        let editingMediaId: null | string = null;

        const close = () => {
            dialogStore.hideDialog(route);
        }

        const save = (svg: any, svgData: any) => {
            const data = {
                files: [
                    {
                        name: new Date().valueOf() + ".svg",
                        data: svg,
                        type: "image/svg+xml",
                    },
                ],
                gallery: wikiStore.currentEntry.id,
                media: editingMediaId,
            };

            // TODO: Use the replace API when editingMediaId is defined
            let request;
            if (editingMediaId !== null) {
                request = buildRequest("/api/admin/gallery/media/replace", data, "PUT");
            } else {
                request = buildRequest("/api/admin/gallery/upload", data, "POST");
            }
            send(request).then((response: any) => {
                let path = editingMediaId;
                if (editingMediaId === null && response.data.files !== undefined) {
                    path = response.data.files[0].path;
                }
                const drawings = wikiStore.currentEntry.meta.drawings;
                if (drawings === undefined || drawings === null) {
                    wikiStore.currentEntry.meta.drawings = [];
                }
                const svgRequest = buildRequest('/api/admin/svg/store-data', {drawing: {data: svgData, svg: path}}, 'POST');
                send(svgRequest).then(() => {
                    ElMessage({
                        message: 'Saved drawing',
                        type: 'success',
                    });
                    emit('imagesave', path);
                });
            });
        };

        const loadDrawing = function (mediaId: string) {
            editingMediaId = mediaId;
            const data = {media: mediaId};
            const request = buildRequest("/api/admin/svg/load-data", data);
            send(request).then((response: any) => {
                drawingData.value = response.data.data;
                isReady.value = true;
            });
        }

        onMounted(() => {
            const dialogData = dialogStore.getDialogData(route);
            if (dialogData !== null && dialogData.media !== undefined) {
                loadDrawing(dialogData.media);
            } else {
                isReady.value = true;
            }
        })

        return {width, height, save, close, route, drawingData, isReady};
    }
});
</script>

<style lang="scss">
.drawing-dialog {
    header {
        padding: 0;
    }
}
</style>
