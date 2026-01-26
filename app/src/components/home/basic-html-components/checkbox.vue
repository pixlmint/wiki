<template>
    <span class="my-async-checkbox">
        <span v-if="isUpdateRunning" class="loader-container" v-loading="isUpdateRunning"></span>
        <input v-else type="checkbox" :disabled="disabled" @change="handleChange" v-model="isChecked" />
    </span>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useWikiStore } from "@/src/stores/wiki";

const props = defineProps<{ disabled: boolean, checkboxId: number, checked: boolean }>();

const isChecked = ref(props.checked);
const isUpdateRunning = ref(false);

const wikiStore = useWikiStore();

const handleChange = async function() {
    isUpdateRunning.value = true;
    await wikiStore.handleCheckboxToggle(props.checkboxId, isChecked.value); 
    isUpdateRunning.value = false;
}

</script>

<style lang="scss">
.my-async-checkbox {
    --el-loading-spinner-size: 14px;

    .loader-container {
        display: inline-block; 
        width: var(--el-loading-spinner-size);
        height: var(--el-loading-spinner-size);
        margin: 0 3px 0 4px;

        .el-loading-mask {
            background-color: unset;
        }
    }
}
</style>
