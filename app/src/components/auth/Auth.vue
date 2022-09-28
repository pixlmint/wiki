<template>
  <div class="main-content">
    <div class="d-flex gap-1">
      <router-link class="btn btn-primary" to="/">Home</router-link>
      <router-link class="btn btn-primary" to="/auth/login">Login</router-link>
      <router-link class="btn btn-primary" to="/auth/restore-password">Restore Password</router-link>
      <router-link class="btn btn-primary" to="/auth/change-password">Change Password</router-link>
      <router-link class="btn btn-primary" to="/auth/generate-new-token">Generate New Token</router-link>
      <router-link class="btn btn-primary" to="/auth/request-new-password">Request New Password</router-link>
      <vk-button class="btn btn-primary" @click="logout">Logout</vk-button>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      pageTitle: 'Auth',
    }
  },
  created() {
    this.$store.dispatch('setTitle', this.pageTitle);
  },
  methods: {
    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/");
    }
  },
};
</script>