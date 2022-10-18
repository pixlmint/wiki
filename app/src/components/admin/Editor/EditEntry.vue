<template>
  <div>
    <div class="container">
      <v-md-editor @change="updateContent" @save="save" v-model="markdown" :height="wHeight + 'px'"></v-md-editor>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, toRaw} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useAuthStore} from '@/src/stores/auth'
import {useRouter} from 'vue-router'

export default defineComponent({
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
    updateContent() {
      if (!this.wikiStore.currentEntry) {
        return;
      }
      this.unsavedChanges = true;
      const area = document.getElementsByTagName('textarea').item(0);
      if (area === null) {
        return;
      }
      this.wikiStore.currentEntry.raw_content = area.value;
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