<template>
  <i v-bind:class="`fa fa-fw fa-${icon}`"/>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'fa',
  props: {
    icon: '',
  }
})
</script>
