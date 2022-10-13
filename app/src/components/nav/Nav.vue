<template>
  <div id="nav">
	<NavElement v-for="(el, index) in nav" :key="index" :el="el"></NavElement>
  </div>
</template>

<script lang="ts">
import {defineComponent, toRaw} from "vue";
import { useWikiStore } from "@/src/stores/wiki";
import NavElement from "./NavElement.vue";

export default defineComponent({
  name: "Nav",
  components: {
    NavElement,
  },
  created: () => {
    useWikiStore().loadNav();
  },
  computed: {
    nav() {
      const wikiStore = useWikiStore()
      if (wikiStore.nav === null) {
        return {}
      }
      console.log(toRaw(wikiStore.nav));
      return toRaw(wikiStore.nav);
    },
  },
});
</script>