<template>
  <div>
    <Loading v-if="isLoading"></Loading>
    <div class="header">
      <h1 @click="reload" class="reloadable">{{ pageTitle }}</h1>
    </div>
    <router-view></router-view>
    <specific-entry-popup></specific-entry-popup>
  </div>
</template>

<script>
import Loading from './src/components/Loading';
import SpecificEntryPopup from './src/components/Modals/SpecificEntryPopup';
import axios from 'axios';

export default {
  name: "App",
  components: {
    Loading,
    SpecificEntryPopup,
  },
  computed: {
    isLoading: function () {
      return this.$store.getters.loading;
    },
    pageTitle() {
      return this.$store.getters.pageTitle;
    },
  },
  created() {
    this.$store.dispatch("getToken");
    this.$store.dispatch("getEntries");
    this.axios.interceptors.request.use(
      (config) => {
        this.$store.commit("LOADING", true);
        return config;
      },
      (error) => {
        this.$store.commit("LOADING", false);
        return Promise.reject(error);
      }
    );
    this.axios.interceptors.response.use(
      (response) => {
        this.$store.commit("LOADING", false);
        return response;
      },
      (error) => {
        this.$store.commit("LOADING", false);
        return Promise.reject(error);
      }
    );
    axios.get('/api/auth/admin-created').then((response) => {
      const adminCreated = response.data.adminCreated;
      if (!adminCreated) {
        this.$router.push('/auth/create-admin');
      }
    })
  },
  methods: {
    reload() {
      this.$store.dispatch("getEntries");
    },
  },
};
</script>
