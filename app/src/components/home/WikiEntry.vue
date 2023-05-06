<template>
  <div class="article">
    <div class="article-head">
      <h1>{{ title }}</h1>
      <div v-if="canEdit">
        <a class="dropdown-item" @click="deleteEntry" title="Delete">Delete</a>
        <a class="dropdown-item" :href="'/admin/edit?p=' + entry" title="Edit">Edit</a>
      </div>
    </div>
    <div class="article-body">
      <p v-html="content"></p>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useMainStore} from "@/src/stores/main";
import fa from '@/src/components/fa.vue'
import {useRoute} from "vue-router";

export default defineComponent({
  name: "WikiEntry",
  data: () => {
    return {
      entry: useRoute().path,
      wikiStore: useWikiStore(),
    }
  },
  components: {
    fa,
  },
  created: function () {
    console.log(this.entry);
  },
  computed: {
    title() {
      return this.wikiStore.currentEntry?.meta.title;
    },
    content() {
      return this.wikiStore.currentEntry?.content;
    },
    canEdit() {
      return true;
      // return useAuthStore().token !== null;
    },
  },
  methods: {
    deleteEntry() {
      const doDelete = confirm("Are you sure you want to delete this entry");
      if (doDelete) {
        // useWikiStore().deleteEntry(this.entry.id, useAuthStore().token);
      }
    },
  },
})
</script>