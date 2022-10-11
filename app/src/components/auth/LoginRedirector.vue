<template>
  <div>
    Redirecting...
  </div>
</template>

<script>
import {defineComponent} from "vue";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/src/stores/auth";

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