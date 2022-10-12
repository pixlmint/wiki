<template>
  <div class="main-content">
    <EditEntry :entry="entry"></EditEntry>
  </div>
</template>

<script lang="ts">
import EditEntry from "./EditEntry.vue";
import {defineComponent} from "vue";
import {useAuthStore} from '@/src/stores/auth'

export default defineComponent({
  props: ["entry"],
  data: function () {
    return {
      title: "Edit " + this.entry,
    }
  },
  created() {
    const token = useAuthStore().token;
    if (token === null) {
      throw new Error('You are not allowed to edit entries');
    }

    console.log(this.entry);
    // useWikiStore().getEntry(this.entry, token)
    //   .then(() => {
    //     const title = useWikiStore().editingEntry.meta.title;
    //     useMainStore().setTitle("Edit " + useWikiStore().editingEntry.meta.title);
    //   })
  },
  components: {
    EditEntry,
  },
})
</script>