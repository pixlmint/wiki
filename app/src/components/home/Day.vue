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

<script>
export default {
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
      return this.$store.getters.token !== null;
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
          token: this.$store.getters.token,
        }
        this.$store.dispatch("deleteEntry", data).then((response) => {
          this.$store.dispatch("getEntries");
        });
      }
    },
  },
};
</script>