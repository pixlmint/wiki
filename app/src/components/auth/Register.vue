<template>
  <div class="main-content">
    <div>
      <router-link class="btn" to="/auth">Return</router-link>
    </div>
    <form @submit.prevent="submit">
      <div class="form-row">
        <input v-model="username" placeholder="Username" type="text" />
      </div>
      <div class="form-row">
        <input v-model="email" placeholder="Email" type="email" />
      </div>
      <div class="form-row">
        <input v-model="password1" placeholder="Password" type="password" />
      </div>
      <div class="form-row">
        <input
          v-model="password2"
          placeholder="Repeat Password"
          type="password"
        />
      </div>
      <button class="mt-1" type="submit">Submit</button>
    </form>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      username: "",
      email: "",
      password1: "",
      password2: "",
    };
  },
  methods: {
    submit() {
      console.log(this.username, this.email, this.password1, this.password2);
    },
  },
};
</script>
