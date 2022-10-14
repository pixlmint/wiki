<template>
  <div>
    <ul>
      <li>
        <a class="nav-item" :href="el.id">{{ el.title }}</a>
        <NavElement v-show="el.showing" class="nav-child-nav" v-for="(subEl, index) in el.children" :key="index"
                    :el="subEl"></NavElement>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'NavElement',
  props: ['el'],
})
</script>