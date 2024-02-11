<template>
  <div :style="'width: ' + loadingWidth + '%'" class="loader"></div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useLoadingStore} from "pixlcms-wrapper";

export default defineComponent({
  name: "PWLoading",
  computed: {
    loadingWidth() {
      return useLoadingStore().getEstimatedProgress;
    },
  }
});
</script>

<style scoped>
.loader {
    display: block;
    position: fixed;
    height: 3px;
    width: 0;
    top: 0;
    background-color: var(--wiki-accent-color);
    z-index: 100;
    border-top-right-radius: 1px;
    border-top-left-radius: 1px;
}
</style>