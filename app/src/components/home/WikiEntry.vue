<template>
  <div class="article">
    <div class="article-head">
      <h3>{{ title }}</h3>
      <div v-if="canEdit">
        <button class="btn btn-icon btn-rounded">
          <fa icon="ellipsis-v"></fa>
        </button>
        <div class="dropdown">
            <a class="dropdown-item" @click="deleteEntry" title="Delete">Delete</a>
            <a class="dropdown-item" :href="'/edit?' + query" title="Edit">Edit</a>
        </div>
      </div>
    </div>
    <div class="article-body">
      <p v-html="content"></p>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore} from '@/src/stores/auth'
import {useWikiStore} from '@/src/stores/wiki'
import fa from '@/src/components/fa.vue'
import {queryFormatter} from "@/src/helpers/queryFormatter";
import {useRoute} from "vue-router";

export default defineComponent({
  name: "WikiEntry",
  data: () => {
    return {
      entry: useRoute().path,
    }
  },
  components: {
    fa,
  },
  computed: {
    title() {
      return this.entry.meta.title;
    },
    content() {
      return this.entry.content;
    },
    canEdit() {
      return useAuthStore().token !== null;
    },
    query() {
      const q = { entry: this.entry.id };
      return queryFormatter(q);
    },
  },
  methods: {
    deleteEntry() {
      const doDelete = confirm("Are you sure you want to delete this entry");
      if (doDelete) {
        useWikiStore().deleteEntry(this.entry.id, useAuthStore().token);
      }
    },
  },
})
</script>