<template>
  <div class="wiki">
    <pw-loading></pw-loading>
    <pw-nav></pw-nav>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "@/src/stores/auth";
import {useWikiStore} from "@/src/stores/wiki";

export default defineComponent({
  name: "App",
  components: {
  },
  data: () => {
    return {
      mainStore: useMainStore(),
      wikiStore: useWikiStore(),
    }
  },
  created() {
    useAuthStore().loadToken();
    const entry = document.location.pathname;
    this.wikiStore.fetchEntry(entry).then(function () {
      const currentEntry = useWikiStore().currentEntry;
      if (currentEntry === null) {
        throw 'currentEntry is null';
      }
      useMainStore().setTitle(currentEntry.meta.title);
    });
  },
})
</script>

<style lang="scss">
@import './style/main.scss';
</style>