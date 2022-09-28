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
export default {
  data: () => {
    return {
      username: "",
      password: "",
      title: "Login",
    };
  },
  created() {
    this.$store.dispatch('setTitle', this.title);
  },
  methods: {
    login() {
      this.$store
        .dispatch("login", {
          username: this.username,
          password: this.password,
        })
        .then(() => {
          this.$router.push("/");
        });
    },
    auth() {
      this.$router.push("/auth");
    }
  },
};
</script>