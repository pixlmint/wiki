<template>
  <div class="admin-bar">
    <h3>Welcome Admin</h3>
    <div class="navbar">
      <div class="navbar-nav">
        <div class="navbar-nav-item"
          v-for="(item, index) in nav"
          :key="index"
          @click="handleClick(index)"
          :title="item.label"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useRouter} from 'vue-router'

interface NavItem {
  label: string,
  func: null | Function,
  page: null | string,
}

export default defineComponent({
  name: "AdminBar",
  data: function () {
    return {
      nav: [
        {
          label: "Auth",
          page: "/auth",
          func: null,
        },
        {
          label: "More",
          page: "/admin/tools",
          func: null,
        },
      ],
    };
  },
  methods: {
    handleClick(itemId: number) {
      const item = (<NavItem> this.nav[itemId]);
      if (item.func !== null) {
        item.func();
      } else if (item.page !== null) {
        useRouter().push(item.page);
      } else {
        console.error('I don\'t know what to do with item #' + itemId);
      }
    },
  },
})
</script>
