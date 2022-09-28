<template>
  <div v-if="isShowing" class="image">
    <div class="img-controls">
      <vk-button class="btn btn-rounded btn-icon" @click="copyUrl">
        <fa icon="clipboard"></fa>
      </vk-button>
      <vk-button class="btn btn-rounded btn-danger btn-icon" @click="deleteImage">
        <fa icon="trash"></fa>
      </vk-button>
    </div>
    <img :src="img" alt="Image" />
    <div class="url">![uploaded image]({{ img }})</div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  props: ["img", "myId"],
  data: function() {
    return {
      isShowing: true,
    };
  },
  methods: {
    deleteImage() {
      if (!confirm('Are you sure you want to delete this image?')) {
        return;
      }
      const data = {
        image: this.img,
        token: this.$store.getters.token,
      };
      let query = Object.entries(data)
        .map(([key, val]) => `${key}=${val}`)
        .join("&");

      axios.delete('/api/admin/entry/image/delete?' + query)
        .then((response) => {
          this.isShowing = false;
        });
    },
    copyUrl() {
      const imgUrl = document.querySelector(
        ".image#img-" + this.myId + " .url"
      );
      const range = document.createRange();
      range.selectNode(imgUrl);
      window.getSelection().addRange(range);

      console.log(document.execCommand("copy"));

      window.getSelection().removeAllRanges();
    },
  },
};
</script>

<style lang="scss" scoped>
.image {
  width: 50%;
  position: relative;

  img {
    width: 100%;
  }

  .url {
    font-size: 1px;
  }

  &:hover .img-controls {
    display: flex;
  }
}

.img-controls {
  display: none;
  height: 100%;
  width: 100%;
  background-color: rgba(116, 116, 116, 0.25);
  position: absolute;
  top: 0;
  justify-content: center;
  align-items: center;
}

@media screen and (min-width: 500px) {
  .image {
    width: 25%;
  }
}
</style>