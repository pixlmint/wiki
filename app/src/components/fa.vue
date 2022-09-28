<template functional>
  <i v-bind:class="`fa fa-fw fa-${icon}`"/>
</template>

<script>
export default {
  name: 'fa',
  props: {
    icon: '',
  }
}
</script>
