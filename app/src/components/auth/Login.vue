<template>
  <div class="main-content">
    <div>
      <vk-button class="btn btn-primary" @click="auth">Return</vk-button>
    </div>
    <form @submit.prevent="login">
      <fieldset class="uk-fieldset">
        <div class="form-row">
          <input class="uk-input" @keyup.enter="login" v-model="username" placeholder="username" />
        </div>
        <div class="form-row">
          <input class="uk-input" @keyup.enter="login" v-model="password" placeholder="password" type="password" />
        </div>
      </fieldset>
      <vk-button class="btn btn-primary" @click="login">Login</vk-button>
    </form>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import {useAuthStore} from "@/src/stores/auth";
import {useMainStore} from "@/src/stores/main";
import {useRouter} from "vue-router";

export default defineComponent({
  data: () => {
    return {
      username: "",
      password: "",
      router: useRouter(),
    };
  },
  created() {
    useMainStore().setTitle('Login');
  },
  methods: {
    login() {
      useAuthStore().login({
        username: this.username,
        password: this.password,
      }).then(() => {
        this.router.push('/');
      })
    },
    auth() {
      this.router.push('/auth')
    }
  },
})
</script>