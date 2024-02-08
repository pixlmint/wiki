<template>
    <div>
        <el-card shadow="never">
            <h2>{{ list.name }}</h2>
            <draggable :list="list.items">
                <item v-for="item in list.items" :key="item.id" :name="item.name" :id="item.id"></item>
            </draggable>
        </el-card>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {VueDraggableNext} from "vue-draggable-next";
import Item from "@/src/components/kanban/item.vue";

export default defineComponent({
    name: "List",
    components: {
        draggable: VueDraggableNext,
        item: Item,
    },
    props: ['list'],
});
</script>