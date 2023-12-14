<template>
  <el-dialog title="Draw" v-model="isShowing">
    <p5-canvas></p5-canvas>
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