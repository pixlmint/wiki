<template>
  <div class="main-content">
    <EditEntry :entry="entry"></EditEntry>
  </div>
</template>

<script>
import EditEntry from "./EditEntry.vue";
import {defineComponent} from "vue";

export default defineComponent({
  props: ["entry"],
  data: function () {
    return {
      title: "Edit " + this.entry,
    }
  },
  created() {
    this.$store
      .dispatch("getEntry", {
        entry: this.entry,
        token: this.$store.getters.token,
      })
      .then(() => {
        this.$store.dispatch('setTitle', "Edit " + this.$store.getters.editingEntry.meta.title);
        this.$store.dispatch("loadImagesForEntry", { entry: this.entry });
      });
  },
  components: {
    EditEntry,
  },
})
</script>