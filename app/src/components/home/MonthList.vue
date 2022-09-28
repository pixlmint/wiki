<template>
  <div class="main-content">
    <AdminBar v-if="canEdit" />
    <div class="month" v-for="month in months" :key="month.id">
      <Month :month="month" />
    </div>
  </div>
</template>

<script>
import Month from "./Month";
import AdminBar from "../admin/AdminBar";

export default {
  name: "MonthList",
  components: {
    Month,
    AdminBar,
  },
  data: function() {
    return {
      title: '2022'
    }
  },
  created() {
    this.$store.dispatch('setTitle', this.title);
  },
  computed: {
    months() {
      return this.$store.getters.entries;
    },
    canEdit() {
      return this.$store.getters.token !== null;
    },
  },
};
</script>
