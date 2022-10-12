<template>
  <div class="main-content">
    <div>
      <vk-button class="btn btn-icon btn-primary" @click="checkGoHome">
        <fa icon="arrow-left"></fa>
      </vk-button>
    </div>
    <div class="container">
      <textarea @change="updateContent" id="edit-entry" ref="editEntry" class="edit-entry" :value="markdown"></textarea>
      <div class="actions">
        <vk-button class="btn btn-icon btn-primary" @click="save">
          <fa icon="floppy-o"></fa>
        </vk-button>
      </div>
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
  },
  methods: {
    updateContent() {
      this.unsavedChanges = true;
      const newContentField = (<HTMLInputElement> document.getElementById('edit-entry'));
      if (newContentField === null) {
        throw new Error('Unable to find field edit-entry')
      }
      let newContent = newContentField.value;
      newContent = newContent.replace(/…/g, '...');
      newContent = newContent.replace(/’/g, '\'');
      newContent = newContent.replace(/“/g, '"');
      newContent = newContent.replace(/”/g, '"');
      newContent = newContent.replace(/„/g, '"');
      newContentField.value = newContent;
      const entry = this.wikiStore.currentEntry;
      if (entry === null) {
        throw new Error('Entry is not defined');
      }
      entry.raw_content = newContent;
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