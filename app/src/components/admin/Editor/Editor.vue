<template>
  <div>
    <EditorHead/>
    <EditEntry :entry="entry"></EditEntry>
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
      entry: '',
    }
  },
  created() {
    const token = useAuthStore().getToken;
    if (token === null) {
      // TODO: uncomment
      // throw new Error('You are not allowed to edit entries');
    }
    const entry = new URLSearchParams(location.search).get('p');
    if (entry != null) {
      this.entry = entry;
    }
    useWikiStore().fetchEntry(this.entry).then(() => {
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