<template>
  <div>
    <input
      accept="video/*"
      @change="uploadVideo"
      type="file"
      label="Upload Video"
    />
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: ["entry"],
  methods: {
    uploadVideo(e) {
      const files = e.target.files;
      const editingEntry = this.$store.getters.editingEntry;
      Array.from(files).forEach((vid) => {
        const formData = new FormData();
        formData.append(Array.from(files).indexOf(vid), vid);
        formData.append("entry", this.entry);
        formData.append("token", this.$store.getters.token);
        axios.post("/api/entry/gallery/upload", formData).then((response) => {
          const vid = response.data.files[0][1080];
          console.log(vid);
          editingEntry.raw_content +=
            "![uploaded video](" + encodeURI(vid) + ")";
        });
      });
      this.$store.dispatch("updateEntry", { entry: editingEntry });
      this.$store.dispatch("loadImagesForEntry", { entry: editingEntry.id });
    },
  },
};
</script>