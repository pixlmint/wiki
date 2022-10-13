<template>
  <div>
    <span>{{ el.title }}</span>
    <NavElement v-for="(subEl, index) in el.children" :key="index" :el="subEl"></NavElement>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'NavElement',
  props: ['el'],
  created: () => {
    console.log(this.el);
  }
})
</script>