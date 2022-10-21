<template>
    <div class="d-flex gap-1 editor-header ai_center">
      <button class="btn btn-icon btn-primary" @click="checkGoHome">
        <fa icon="arrow-left"></fa>
      </button>
      <input class="title-editor" @change="rename" :value="title"/>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {useWikiStore} from '@/src/stores/wiki';
import {useAuthStore} from '@/src/stores/auth';
import fa from '@/src/components/fa.vue'

export default defineComponent({
  name: "EditorHead",
  computed: {
    title() {
      return useWikiStore().currentEntry?.meta.title;
    },
  },
  methods: {
    save() {
      return useWikiStore().saveEntry(useAuthStore().token)
    },
    rename(e: InputEvent) {
      const newTitle = e.target?.value;
      if (newTitle === null) {
        return;
      }
      useWikiStore().renameEntry(newTitle, useAuthStore().token)
    }
  },
  components: {
    fa,
  },
})
</script>