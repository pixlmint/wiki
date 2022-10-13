<template>
  <div>
	<NavElement v-for="(el, index) in nav" v-key="index" :key="index" :el="el"></NavElement>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
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
      return useWikiStore().nav;
    },
  },
});
</script>