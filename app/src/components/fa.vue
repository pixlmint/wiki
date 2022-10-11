<template functional>
  <i v-bind:class="`fa fa-fw fa-${icon}`"/>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: 'fa',
  props: {
    icon: '',
  }
})
</script>
