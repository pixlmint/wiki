<template>
    <div>
        <two-lists-tests></two-lists-tests>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import TwoListsTests from "@/src/components/kanban/two-lists-test.vue";

export default defineComponent({
    name: 'Board',
    components: {
        TwoListsTests,
    },
    data() {
        return {
            enabled: true,
            tasks: [
                {
                    name: 'task 1',
                    header: 'list 1',
                    children: [
                        {
                            name: 'task 2',
                            children: [],
                        },
                    ],
                },
                {
                    name: 'task 3',
                    children: [
                        {
                            name: 'task 4',
                            children: [],
                        },
                    ],
                },
                {
                    name: 'task 5',
                    children: [],
                },
            ],
            board: [
                {
                    name: 'Tasks',
                    id: '1',
                    items: [
                        {name: 'John', id: 1},
                    ],
                },
                {
                    name: 'Doing',
                    id: '2',
                    items: [
                        {name: 'Joao', id: 6},
                    ],
                },
                {
                    name: 'Done',
                    id: '3',
                    items: [
                        {name: 'Jean', id: 11},
                        {name: 'Gerard', id: 12},
                    ],
                },
            ],
            dragging: false,
        }
    },
    created() {
        console.log('board');
    },
    methods: {
        log(event: Event) {
            console.log(event)
        },
    },
})

</script>

<style lang="scss">
.board {
    display: flex;
    width: 100%;
    gap: 1rem;

    .boardList {
        width: 300px;
    }
}

.drag-area {
    min-height: 200px;
    outline: 1px dashed;
}
</style>
