<template>
	<div></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
	name: 'NavElement',
	props: ['el'],
	created: () => {
		if (this != undefined) {
			console.log(this.el);
		}
	}
})
</script>