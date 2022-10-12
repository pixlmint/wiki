<template>
  <div class="main-content">
    <form>
      <input class="uk-input" type="text" v-model="username" placeholder="Admin Username">
      <input class="uk-input" type="text" v-model="password" placeholder="Admin Password">
      <button class="btn btn-primary" @click="submit">Submit</button>
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore} from "@/src/stores/auth";
import {useRouter} from "vue-router";

export default defineComponent({
  data: function () {
    return {
      username: '',
      password: '',
    }
  },
  methods: {
    submit() {
      useAuthStore()
          .createAdmin(this.username, this.password)
          .then((response) => {
            if (response.data.adminCreated) {
              useRouter().push('/auth/login');
            }
          })
    }
  }
})
</script>