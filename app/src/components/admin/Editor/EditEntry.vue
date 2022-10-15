<template>
  <div>
    <div class="container">
      <v-md-editor @save="save" v-model="markdown" :height="wHeight + 'px'"></v-md-editor>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useAuthStore} from '@/src/stores/auth'
import {useRouter} from 'vue-router'

export default defineComponent({
  props: ["entry"],
  data: function () {
    return {
      unsavedChanges: false,
      wikiStore: useWikiStore(),
    }
  },
  computed: {
    markdown() {
      if (this.wikiStore.currentEntry === null) {
        return '';
      }
      return this.wikiStore.currentEntry.raw_content;
    },
    wHeight() {
      return window.innerHeight-150;
    },
  },
  methods: {
    updateContent(md: string) {
      this.unsavedChanges = true;
      const entry = this.wikiStore.currentEntry;
      if (entry === null) {
        throw new Error('Entry is not defined');
      }
      entry.raw_content = md;
      this.wikiStore.updateEntry(entry);
    },
    save() {
      this.unsavedChanges = false;
      return this.wikiStore.saveEntry(useAuthStore().token)
    },
    checkGoHome() {
      if (this.unsavedChanges && confirm('You\'ve go unsaved changes. Save first?')) {
        this.save().then(() => {
          this.doGoHome();
        });
      } else {
        this.doGoHome();
      }
    },
    doGoHome() {
      useRouter().push('/');
    }
  },
})
</script>