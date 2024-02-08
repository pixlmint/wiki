<template>
    <div class="board">
        <el-card v-for="list in board" :key="list.id">
            <draggable :list="list.items" group="board" itemKey="name">
                <template #item="{element, index}">
                    <el-card shadow="never">
                        {{ element.name }} {{ index }}
                    </el-card>
                </template>
            </draggable>
        </el-card>
    </div>
</template>

<script setup>
import draggable from "vuedraggable";
import {ref} from "vue";

const board = ref([
    {
        name: 'Tasks',
        id: 1,
        items: [
            {name: 'John', id: 1},
            {name: 'Terry', id: 2},
        ],
    },
    {
        name: 'Doing',
        id: 2,
        items: [
            {name: 'Joao', id: 6},
            {name: 'Tim', id: 7},
        ],
    },
    {
        name: 'Done',
        id: 3,
        items: [
            {name: 'Jean', id: 11},
            {name: 'Gerard', id: 12},
        ],
    },
])
</script>