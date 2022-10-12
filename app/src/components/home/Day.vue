<template>
  <div class="article">
    <div class="article-head">
      <h3>{{ formattedDate }}</h3>
      <div v-if="canEdit">
        <vk-button class="btn btn-icon btn-rounded">
          <fa icon="ellipsis-v"></fa>
        </vk-button>
        <vk-dropdown>
          <vk-nav-dropdown>
            <vk-nav-item @click="deleteEntry" title="Delete">Delete</vk-nav-item>
            <vk-nav-item :href="'/edit?' + query" title="Edit">Edit</vk-nav-item>
          </vk-nav-dropdown>
        </vk-dropdown>
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

export default defineComponent({
  name: "Day",
  props: ["day"],
  computed: {
    formattedDate() {
      return this.day.meta.title;
    },
    content() {
      return this.day.content;
    },
    canEdit() {
      return useAuthStore().token !== null;
    },
    query() {
      const q = { entry: this.day.id };
      let query = Object.entries(q)
        .map(([key, val]) => `${key}=${val}`)
        .join("&");
      return query;
    },
  },
  methods: {
    deleteEntry() {
      const doDelete = confirm("Are you sure you want to delete this entry");
      if (doDelete) {
        const data = {
          entry: this.day.id,
          token: useAuthStore().token,
        }
        useWikiStore().deleteEntry(this.day.id, useAuthStore().token);
      }
    },
  },
})
</script>