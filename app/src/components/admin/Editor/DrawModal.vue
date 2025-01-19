<template>
    <pm-dialog class="drawing-dialog" style="padding: 0" :fullscreen="true" :route="route">
        <!--<d3-canvas @save="save" :width="width" :height="height"></d3-canvas>-->
        <ExcalidrawWrapper @save="save" :width="width" :height="height"/>
    </pm-dialog>
</template>

<script lang="ts">
import {useWikiStore} from "@/src/stores/wiki";
import {Drawing} from "@/src/contracts/Canvas";
import {useDialogStore, buildRequest, send} from "pixlcms-wrapper";
// import D3Canvas from "@/src/components/drawing/d3canvas.vue";
import ExcalidrawWrapper from "@/src/components/drawing/excalidraw.vue";
import {computed, defineComponent} from "vue";

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
            return (window.innerHeight - 100).toString();
        });

        const save = (svg: any, svgData: any) => {
            const data = {
                files: [
                    {
                        name: new Date().valueOf() + ".svg",
                        data: svg,
                        type: "image/svg+xml",
                    },
                ],
                gallery: wikiStore.safeCurrentEntry.id,
            };

            const request = buildRequest("/api/admin/gallery/upload", data, "POST");
            send(request).then((response: Response) => {
                const path = response.data.files[0].path;
                const drawings = wikiStore.safeCurrentEntry.meta.drawings;
                if (drawings === undefined || drawings === null) {
                    wikiStore.safeCurrentEntry.meta.drawings = [];
                }
                // emit('imagesave', path);
                const svgRequest = buildRequest('/api/admin/svg/store-data', {drawing: svgData}, 'POST');
                send(svgRequest).then((response: Response) => {
                    emit('imagesave', path);
                });
            });
        };

        return {width, height, save, route};
    }
});
</script>

<style lang="scss">
.drawing-dialog {
    header {
        padding: 0;
    }

    .el-dialog__body {
        margin-top: 50px;
    }
}
</style>
