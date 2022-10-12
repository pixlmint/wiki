<template>
  <div>
    <Loading v-if="isLoading"></Loading>
    <div class="header">
      <h1>{{ pageTitle }}</h1>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import Loading from './src/components/Loading';
import axios from 'axios';
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "@/src/stores/auth";
import {useRouter} from "vue-router";

export default defineComponent({
  name: "App",
  components: {
    Loading,
  },
  data: () => {
    return {
      mainStore: useMainStore(),
    }
  },
  computed: {
    isLoading: function () {
      return this.mainStore.loading;
    },
    pageTitle() {
      return this.mainStore.pageTitle;
    },
  },
  created() {
    useAuthStore().getToken();
    this.axios.interceptors.request.use(
      (config) => {
        this.mainStore.setIsLoading(true);
        return config;
      },
      (error) => {
        this.mainStore.setIsLoading(false);
        return Promise.reject(error);
      }
    );
    this.axios.interceptors.response.use(
      (response) => {
        this.mainStore.setIsLoading(true);
        return response;
      },
      (error) => {
        this.mainStore.setIsLoading(false);
        return Promise.reject(error);
      }
    );
    axios.get('/api/auth/admin-created').then((response) => {
      const adminCreated = response.data.adminCreated;
      if (!adminCreated) {
        useRouter().push('/auth/create-admin');
      }
    })
  },
})
</script>
