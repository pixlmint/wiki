<template>
  <div>
    <vk-modal :show.sync="show">
      <vk-modal-close @click="hidePopup"></vk-modal-close>
      <vk-modal-title>Edit Specific Entry</vk-modal-title>
      <div>
        <input type="date" v-model="dateEntry" />
      </div>
      <div slot="footer">
        <div class="uk-text-right">
          <vk-button class="btn btn-primary" @click="editSpecificEntry">Submit</vk-button>
        </div>
      </div>
    </vk-modal>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";

export default {
  data: function () {
    return {
      dateEntry: moment().format("yyyy-MM-DD"),
    };
  },
  computed: {
    show: {
      get() {
        return this.$store.getters.showEditSpecificPopup;
      },
      set(newValue) {
        this.$store.commit("EDIT_SPECIFIC_POPUP", newValue);
      },
    },
  },
  methods: {
    hidePopup() {
      this.$store.commit("EDIT_SPECIFIC_POPUP", false);
    },
    editSpecificEntry() {
      axios
        .get(
          "/api/admin/entry/create?token=" +
          this.$store.getters.token +
          "&entry=" +
          this.dateEntry
        )
        .then((response) => {
          this.$store.commit("EDIT_SPECIFIC_POPUP", false);
          this.$router.push("/edit?entry=" + response.data.entryId);
        });
    },
  },
};
</script>