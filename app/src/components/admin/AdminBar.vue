<template>
  <div class="admin-bar">
    <h3>Welcome Admin</h3>
    <vk-navbar>
      <vk-navbar-nav>
        <vk-navbar-nav-item
          v-for="(item, index) in nav"
          :key="index"
          @click="handleClick(index)"
          :title="item.label"
        ></vk-navbar-nav-item>
        <vk-navbar-item></vk-navbar-item>
      </vk-navbar-nav>
    </vk-navbar>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminBar",
  data: function () {
    return {
      nav: [
        {
          label: "Today",
          func: this.editCurrent,
        },
        {
          label: "Edit Specific",
          func: this.toggleEditSpecificPopup,
        },
        {
          label: "Auth",
          page: "/auth",
        },
        {
          label: "More",
          page: "/admin/tools",
        },
      ],
    };
  },
  methods: {
    handleClick(itemId) {
      const item = this.nav[itemId];
      if ("func" in item) {
        item.func();
      } else if ("page" in item) {
        this.$router.push(item.page);
      } else {
        console.error('I don\'t know what to do with item #' + itemId);
      }
    },
    toggleEditSpecificPopup() {
      this.$store.commit('EDIT_SPECIFIC_POPUP', true);
    },
    editCurrent() {
      axios
        .get("/api/admin/entry/edit/current?token=" + this.$store.getters.token)
        .then((response) => {
          this.$router.push("/edit?entry=" + response.data.entryId);
        });
    },
  },
};
</script>
