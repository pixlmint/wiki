<template>
  <div class="main-content">
    <AdminBar v-if="canEdit" />
    <div class="month" v-for="month in months" :key="month.id">
      <Month :month="month" />
    </div>
  </div>
</template>

<script lang="ts">
import Month from "@/src/components/home/Month.vue";
import AdminBar from "@/src/components/admin/AdminBar.vue";
import { defineComponent } from "vue";
import {useMainStore} from '@/src/stores/main'

export default defineComponent({
  name: "MonthList",
  components: {
    Month,
    AdminBar,
  },
  created() {
    useMainStore().setTitle('Wiki')
  },
  computed: {
    months: function() {
      return [];
    },
    canEdit: function() {
      return true;
    }
  },
});
</script>
