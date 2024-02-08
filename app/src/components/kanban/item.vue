<template>
    <div>
        <el-card shadow="never" class="box-card">
            {{ name }}
        </el-card>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    name: "Item",
    props: ['id', 'name'],
})
</script>