<template>
  <div>
    <ul>
      <li>
        <span class="nav-item" @mouseover="dropdownButtonShowing = true" @mouseleave="dropdownButtonShowing = false">
          <a class="nav-item-link" :href="el.id">{{ el.title }}</a>
          <button :style="'display: ' + dropdownButtonDisplay" class="btn nav-options"
                  @click="dropdownShowing = !dropdownShowing">
            <fa icon="ellipsis-v"></fa>
          </button>
          <div v-show="dropdownShowing" class="nav-options-dropdown">
            <ul>
              <li>
                <button class="nav-item" @click="addFolder">Add Folder</button>
              </li>
              <li>
                <button class="nav-item" @click="addEntry">Add Entry</button>
              </li>
              <li>
                <button class="nav-item" @click="deleteEntry">Delete Entry</button>
              </li>
            </ul>
          </div>
        </span>
        <NavElement class="nav-child-nav" v-for="(subEl, index) in el.children" :key="index"
                    :el="subEl"></NavElement>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import fa from '@/src/components/fa.vue';
import {useWikiStore} from '@/src/stores/wiki';
import {useAuthStore} from '@/src/stores/auth';

export default defineComponent({
  name: 'NavElement',
  props: ['el'],
  data: () => {
    return {
      dropdownShowing: false,
      dropdownButtonShowing: false,
    }
  },
  components: {
    fa,
  },
  computed: {
    dropdownButtonDisplay() {
      return this.dropdownButtonShowing ? 'inline-block' : 'none';
    },
  },
  methods: {
    addFolder() {
      console.log(this.el);
    },
    addEntry() {
      useWikiStore().addEntry(this.el.id, useAuthStore().getToken);
    },
    deleteEntry() {
      useWikiStore().deleteEntry(this.el.id, useAuthStore().token);
    }
  },
})
</script>

<style scoped lang="scss">
.nav-options {
  position: absolute;
}

.nav-options-dropdown {
  display: block;
  position: absolute;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
</style>