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

<script>
export default {
  props: ["entry"],
  data: function () {
    return {
      unsavedChanges: false,
    }
  },
  computed: {
    markdown() {
      return this.$store.getters.editingEntry.raw_content;
    },
  },
  methods: {
    updateContent() {
      this.unsavedChanges = true;
      const newContentField = document.getElementById('edit-entry');
      let newContent = newContentField.value;
      newContent = newContent.replace(/…/g, '...');
      newContent = newContent.replace(/’/g, '\'');
      newContent = newContent.replace(/“/g, '"');
      newContent = newContent.replace(/”/g, '"');
      newContent = newContent.replace(/„/g, '"');
      newContentField.value = newContent;
      console.log(newContent);
      const entry = this.$store.getters.editingEntry;
      entry.raw_content = newContent;
      this.$store.dispatch("updateEntry", {
        entry: entry,
      });

      this.$store.dispatch("updateEntry", {
        entry: entry,
      });
    },
    save() {
      this.unsavedChanges = false;
      return this.$store.dispatch("saveEntry", this.$store.getters.token);
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
      this.$store.dispatch("getEntries");
      this.$router.push('/');
    }
  },
};
</script>