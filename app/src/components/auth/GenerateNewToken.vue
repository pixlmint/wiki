<template>
  <div class="main-content">
    <div>
      <router-link class="btn" to="/auth">Return</router-link>
    </div>
    <form @submit.prevent="submit">
      <div>
        <input placeholder="Username" v-model="username" type="text" />
        <br />
      </div>
      <button class="mt-1" type="submit">Submit</button>
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useAuthStore} from "pixlcms-wrapper";

export default defineComponent({
  data: () => {
    return {
      username: "",
    };
  },
  methods: {
    submit() {
      const authStore = useAuthStore();
      authStore.generateNewToken()
    },
  },
})
</script>
