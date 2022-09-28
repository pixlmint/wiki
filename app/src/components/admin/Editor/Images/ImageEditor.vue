<template>
  <div>
    <input
      accept="image/*,video/*"
      @change="uploadImages"
      type="file"
      label="Upload Images"
      multiple
    />
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: ["entry"],
  methods: {
    uploadImages(e) {
      const files = e.target.files;
      const editingEntry = this.$store.getters.editingEntry;
      Array.from(files).forEach((img) => {
        const formData = new FormData();
        formData.append(Array.from(files).indexOf(img), img);
        formData.append("entry", this.entry);
        formData.append("token", this.$store.getters.token);
        axios.post("/api/entry/gallery/upload", formData).then((response) => {
          const img = response.data.files[0][1080];
          console.log(img);
          editingEntry.raw_content +=
            "![uploaded image](" + encodeURI(img) + ")";
        });
      });
      this.$store.dispatch("updateEntry", { entry: editingEntry });
      this.$store.dispatch("loadImagesForEntry", { entry: editingEntry.id });
    },
  },
};
</script>