<template>
  <div class="main-content">
    <div class="d-flex gap-1">
      <button class="btn btn-icon btn-primary" @click="goHome">
        <fa icon="arrow-left"></fa>
      </button>
      <button class="btn btn-primary" @click="generateBackup">Generate Backup</button>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import {defineComponent} from "vue";
import {useAuthStore} from '@/src/stores/auth'
import {useRouter} from 'vue-router'
import fa from '@/src/components/fa.vue'

export default defineComponent({
  components: {
    fa,
  },
  methods: {
    generateBackup: function () {
      axios
          .get("/api/admin/generate-backup?token=" + useAuthStore().token)
          .then((response) => {
            location.href = response.data.file;
          });
    },
    goHome() {
      useRouter().push('/')
    },
  }
})
</script>