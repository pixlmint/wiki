<template>
  <div>
    <div class="container">
      <pw-md-editor @save="save" @change="updateContent" v-model="markdown"></pw-md-editor>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useRouter} from 'vue-router'
import {useMainStore} from "@/src/stores/main";
import {useUserSettings} from "@/src/stores/user-settings";

let saveTimeout: number | null = null;

const isTimeoutSet = () => {
  return saveTimeout !== null;
}

export default defineComponent({
  data: function () {
    return {
      mainStore: useMainStore(),
      wikiStore: useWikiStore(),
      userSettings: useUserSettings(),
    }
  },
  created() {
    this.wikiStore.editor.lastSaved = new Date();
  },
  computed: {
    markdown: {
      get() {
        if (this.wikiStore.currentEntry === null) {
          return '';
        }
        return this.wikiStore.currentEntry.raw_content;
      },
      set(newMarkdown: string) {
        this.wikiStore.safeCurrentEntry.raw_content = newMarkdown;
      }
    },
  },
  methods: {
    updateContent() {
      if (!this.wikiStore.currentEntry) {
        console.error('Not editing an entry');
        return '';
      }
      this.mainStore.setHasUnsavedChanges(true);
      const area = document.getElementsByTagName('textarea').item(0);
      if (area === null) {
        console.error('Unable to find the text area');
        return '';
      }
      this.wikiStore.currentEntry.raw_content = area.value;

      if (this.userSettings.getSettings.autoSave && !isTimeoutSet()) {
        saveTimeout = window.setTimeout(() => {
          this.save();
          saveTimeout = null;
        }, 5000);
      }
    },
    save() {
      this.mainStore.setHasUnsavedChanges(false);
      return this.wikiStore.saveEntry()
    },
    checkGoHome() {
      if (this.mainStore.editingUnsavedChanges && confirm('You\'ve go unsaved changes. Save first?')) {
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

<style scoped lang="scss">
.container {
  margin-top: 1rem;
}
</style>