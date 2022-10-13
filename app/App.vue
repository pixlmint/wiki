<template>
  <div>
    <Loading v-if="isLoading"></Loading>
    <div class="header">
      <h1>{{ pageTitle }}</h1>
    </div>
    <Nav></Nav>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Loading from './src/components/Loading.vue';
import axios from 'axios';
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "@/src/stores/auth";
import {useRouter} from "vue-router";
import Nav from '@/src/components/nav/Nav.vue';

export default defineComponent({
  name: "App",
  components: {
    Loading,
    Nav,
  },
  data: () => {
    return {
      mainStore: useMainStore(),
    }
  },
  computed: {
    isLoading: function () {
      return false;
      // return this.mainStore.loading;
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
