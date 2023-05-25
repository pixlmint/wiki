<template>
  <div>
    <EditorHead/>
    <EditEntry></EditEntry>
  </div>
</template>

<script lang="ts">
import EditEntry from "./EditEntry.vue";
import EditorHead from './EditorHead.vue';
import {defineComponent} from "vue";
import {useAuthStore} from '@/src/stores/auth'
import {useWikiStore} from "@/src/stores/wiki";
import {useMainStore} from "@/src/stores/main";

export default defineComponent({
  data: function () {
    return {
      title: "Edit " + this.entry,
    }
  },
  created() {
    if (!useAuthStore().haveEditRights()) {
      throw new Error('You are not allowed to edit entries');
    }
    let entry = new URLSearchParams(location.search).get('p');
    if (entry === null) {
      entry = '';
    }
    useWikiStore().fetchEntry(entry).then(() => {
      this.title = "Edit " + useWikiStore().currentEntry?.meta.title;
      useMainStore().setTitle(this.title)
    });
  },
  components: {
    EditorHead,
    EditEntry,
  },
})
</script>