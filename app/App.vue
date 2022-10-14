<template>
  <div>
    <!--    <Loading v-if="isLoading"></Loading>-->
    <Nav></Nav>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import Loading from './src/components/Loading.vue';
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "@/src/stores/auth";
import Nav from '@/src/components/nav/Nav.vue';

export default defineComponent({
  name: "App",
  components: {
    // Loading,
    Nav,
  },
  data: () => {
    return {
      mainStore: useMainStore(),
    }
  },
  computed: {
    isLoading: function () {
      return this.mainStore.getIsLoading;
    },
  },
  created() {
    useAuthStore().loadToken();
    const mainStore = this.mainStore;
    this.axios.interceptors.request.use(
        function (config) {
          mainStore.setIsLoading(true);
          return config;
        },
        function (error) {
          mainStore.setIsLoading(false);
          return Promise.reject(error);
        }
    );
    this.axios.interceptors.response.use(
        function (response) {
          mainStore.setIsLoading(false);
          return response;
        },
        function (error) {
          mainStore.setIsLoading(false);
          return Promise.reject(error);
        }
    );
    //axios.get('/api/auth/admin-created').then((response) => {
    //  const adminCreated = response.data.adminCreated;
    //  if (!adminCreated) {
    //    useRouter().push('/auth/create-admin');
    //  }
    //})
  },
})
</script>
