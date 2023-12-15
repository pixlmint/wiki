<template>
  <el-dialog :fullscreen="true" v-model="isShowing">
    <p5-canvas v-if="isShowing" :width="width" :height="height"></p5-canvas>
  </el-dialog>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useDialogStore} from "@/src/stores/dialog";
import P5Canvas from "@/src/components/pw/paint/p5canvas.vue";

const route = '/draw';

export default defineComponent({
  name: "DrawModal",
  components: {P5Canvas},
  data() {
    return {
      dialogStore: useDialogStore(),
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
  }
});
</script>