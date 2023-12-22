<template>
    <el-dialog :fullscreen="true" v-model="isShowing">
        <d3-canvas @save="save" v-if="isShowing" :width="width" :height="height"></d3-canvas>
    </el-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useDialogStore} from "@/src/stores/dialog";
import D3Canvas from "@/src/components/pw/d3canvas.vue";
import {useWikiStore} from "@/src/stores/wiki";

const route = '/draw';

export default defineComponent({
    name: "DrawModal",
    components: {D3Canvas},
    data() {
        return {
            dialogStore: useDialogStore(),
            wikiStore: useWikiStore(),
        }
    },
    computed: {
        width() {
            return (window.innerWidth - 100).toString();
        },
        height() {
            return (window.innerHeight - 100).toString();
        },
        isShowing: {
            get() {
                return route === this.dialogStore.getShowingDialog;
            },
            set() {
                this.dialogStore.clearShowingDialog();
            }
        }
    },
});
</script>

<script lang="ts" setup>
import {useDialogStore} from "@/src/stores/dialog";
import {useWikiStore} from "@/src/stores/wiki";
import {buildRequest, send} from "@/src/helpers/xhr";
import {Drawing} from "@/src/contracts/Canvas";

const wikiStore = useWikiStore();

const emit = defineEmits(['imagesave']);

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
    send(request).then(response => {
        const path = response.data.files[0].path;
        const drawings = wikiStore.safeCurrentEntry.meta.drawings;
        if (drawings === undefined || drawings === null) {
            wikiStore.safeCurrentEntry.meta.drawings = [];
        }
        drawing.svg = path;
        const svgRequest = buildRequest('/api/admin/svg/store-data', {drawing: JSON.stringify(drawing)}, 'POST');
        send(svgRequest).then(response => {
            emit('imagesave', path);
        });
    });
}

</script>