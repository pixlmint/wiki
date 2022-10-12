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
          <vk-button class="btn btn-primary" @click="editSpecificEntry"
            >Submit</vk-button
          >
        </div>
      </div>
    </vk-modal>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import moment from "moment";
import { defineComponent } from "vue";

export default defineComponent({
  data: function () {
    return {
      dateEntry: moment().format("yyyy-MM-DD"),
    };
  },
  computed: {
    show: {
      get() {
        return false;
      },
      set(newValue) {
        console.log(newValue);
      },
    },
  },
  methods: {
    hidePopup() {},
    editSpecificEntry() {},
  },
});
</script>