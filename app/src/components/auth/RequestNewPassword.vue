<template>
  <div class="main-content">
    <div>
      <router-link class="btn" to="/auth">Return</router-link>
    </div>
    <form @submit.prevent="submit">
      <div>
        <input
          placeholder="Username"
          v-model="username"
          id="username"
          type="text"
        />
        <br />
      </div>
      <button class="mt-1" type="submit">Submit</button>
    </form>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import {useAuthStore} from "@/src/stores/auth";

export default defineComponent({
  data: () => {
    return {
      username: "",
    };
  },
  methods: {
    submit() {
      useAuthStore().requestNewPassword(this.username);
    },
  },
})
</script>


<style scoped>
label {
  display: block;
}
</style>