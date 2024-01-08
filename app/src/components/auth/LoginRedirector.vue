<template>
  <div>
    Redirecting...
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useRouter} from "vue-router";
import {useAuthStore} from "pixlcms-wrapper";

export default defineComponent({
  created() {
    const token = useAuthStore().token;
    if (token === null) {
      useRouter().push('/auth/login');
    } else {
      useRouter().push('/');
    }
  }
})
</script>