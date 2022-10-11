<template>
  <div class="main-content">
    <form>
      <input class="uk-input" type="text" v-model="username" placeholder="Admin Username">
      <input class="uk-input" type="text" v-model="password" placeholder="Admin Password">
      <vk-button class="btn btn-primary" @click="submit">Submit</vk-button>
    </form>
  </div>
</template>

<script>
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
      const data = {
        username: this.username,
        password: this.password,
      }
      useAuthStore()
          .createAdmin(data)
          .then((response) => {
            if (response.data.adminCreated) {
              useRouter().push('/auth/login');
            }
          })
    }
  }
})
</script>