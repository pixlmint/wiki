<template>
  <el-dialog :fullscreen="true" v-model="isShowing">
    <p5-canvas @save="save" v-if="isShowing" :width="width" :height="height"></p5-canvas>
  </el-dialog>
</template>

<script lang="ts">
import {defineComponent, toRaw} from "vue";
import {useDialogStore} from "@/src/stores/dialog";
import P5Canvas from "@/src/components/pw/paint/p5canvas.vue";
import {useWikiStore} from "@/src/stores/wiki";
import {buildRequest, send} from "@/src/helpers/xhr";

const route = '/draw';

export default defineComponent({
  name: "DrawModal",
  components: {P5Canvas},
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

const wikiStore = useWikiStore();

const emit = defineEmits(['imagesave']);

const save = (image) => {
      const data = {
        data: image,
        gallery: wikiStore.safeCurrentEntry.id,
      };

      const request = buildRequest("/api/admin/gallery/upload-b64", data, "POST");
      send(request).then(response => {
        emit('imagesave', response.data.scaled[1080]);
      });
}

</script>