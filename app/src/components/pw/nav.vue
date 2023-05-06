<template>
    <el-menu @click="loadPage" :router="true">
        <PWNavElement v-for="(childElement, myIndex) in nav.children"
                      parentIndex="0"
                      :key="myIndex"
                      :element="childElement"
                      :index="myIndex">
        </PWNavElement>
    </el-menu>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from "@/src/stores/wiki";
import {toRaw} from "vue";
import PWNavElement from "@/src/components/pw/nav-element.vue";
import {useMainStore} from "@/src/stores/main";

export default defineComponent({
  name: 'PWNav',
  components: {
    PWNavElement,
  },
  created: () => {
    useWikiStore().loadNav();
  },
  methods: {
    loadPage() {
      console.log(document.location.pathname);
      const entry = document.location.pathname;
      useWikiStore().fetchEntry(entry).then(function () {
        const currentEntry = useWikiStore().currentEntry;
        if (currentEntry === null) {
          throw 'currentEntry is null';
        }
        useMainStore().setTitle(currentEntry.meta.title);
      });
    },
  },
  computed: {
    nav() {
      const wikiStore = useWikiStore()
      if (wikiStore.getNav === null) {
        return {}
      }
      console.log(toRaw(wikiStore.getNav));
      return toRaw(wikiStore.getNav);
    },
  },
})
</script>