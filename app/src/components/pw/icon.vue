<template>
  <font-awesome-icon :icon="'fa-solid fa-' + icon"></font-awesome-icon>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faEraser, faPencil, faHighlighter} from "@fortawesome/free-solid-svg-icons";
import {library} from "@fortawesome/fontawesome-svg-core";

library.add(faEraser, faPencil, faHighlighter);

export default defineComponent({
  name: 'pw-icon',
  components: {FontAwesomeIcon},
  props: ['icon'],
});
</script>