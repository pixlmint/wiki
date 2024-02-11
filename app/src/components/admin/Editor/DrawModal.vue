<template>
    <pm-dialog :fullscreen="true" :route="route">
        <d3-canvas @save="save" :width="width" :height="height"></d3-canvas>
    </pm-dialog>
</template>

<script lang="ts">
import {useWikiStore} from "@/src/stores/wiki";
import {Drawing} from "@/src/contracts/Canvas";
import {useDialogStore, buildRequest, send} from "pixlcms-wrapper";
import D3Canvas from "@/src/components/drawing/d3canvas.vue";
import {computed} from "vue";
import {defineComponent} from "vue";

export const route = '/draw';

export default defineComponent({
    name: "DrawModal",
    components: {
        D3Canvas
    },
    setup(props, {emit}) {
        const dialogStore = useDialogStore();
        const wikiStore = useWikiStore();

        const width = computed(() => {
            return (window.innerWidth - 100).toString();
        });

        const height = computed(() => {
            return (window.innerHeight - 100).toString();
        });

        const save = (drawing: Drawing) => {
            const data = {
                files: [
                    {
                        name: new Date().valueOf() + ".svg",
                        data: drawing.svg,
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
                drawing.svg = path;
                const svgRequest = buildRequest('/api/admin/svg/store-data', {drawing: JSON.stringify(drawing)}, 'POST');
                send(svgRequest).then((response: Response) => {
                    emit('imagesave', path);
                });
            });
        };

        return {width, height, save, route};
    }
});
</script>