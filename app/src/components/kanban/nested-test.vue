<template>
    <div>
        <draggable :class="{board: currentLevel === 0, boardList: currentLevel === 1, dragArea: maxLevels > 0}"
                   :list="children" :group="{ name: 'g1' }">
            <el-card shadow="never" v-for="el in children" :key="el.name">
                <h2 v-if="el.header">{{ el.header }}</h2>
                <p>{{ el.name }}</p>
                <nested-draggable :current-level="currentLevel + 1" :maxLevels="maxLevels - 1"
                                  :children="el.children" class="bg-gray-100 pl-5"/>
            </el-card>
        </draggable>
    </div>
</template>
<script>
import {VueDraggableNext} from "vue-draggable-next";

export default {
    props: {
        children: {
            required: true,
            type: Array,
        },
        maxLevels: {
            required: true,
            type: Number,
        },
        header: {
            required: false,
            type: String,
        },
        currentLevel: {
            required: true,
            type: Number,
        },
    },
    components: {
        draggable: VueDraggableNext,
    },
    name: 'nested-draggable',
}
</script>

<style scoped>
.dragArea {
    min-height: 50px;
    outline: 1px dashed;
}
</style>