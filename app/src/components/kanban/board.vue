<template>
    <div class="board">
        <list v-if="boardLoaded" v-for="list in boardLists" :key="list.id" :list="list"></list>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import List from "@/src/components/kanban/list.vue";
import {useWikiStore} from "@/src/stores/wiki";
import {useBoardStore} from "@/src/stores/board";

export default defineComponent({
    name: 'board',
    components: {
        list: List,
    },
    props: {
        boardId: {
            type: String,
            required: true,
        }
    },
    data() {
        return {
            wikiStore: useWikiStore(),
            boardStore: useBoardStore(),
            boardLoaded: false,
            enabled: true,
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
        this.boardStore.loadBoard(this.boardId).then(() => {
            this.boardLoaded = true;
        });
    },
    computed: {
        boardLists() {
            return this.boardStore.safeCurrentBoard.children;
        },
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
    width: inherit;
    max-width: inherit;
    height: 100%;
    gap: 1rem;
    overflow-x: auto;
    flex-wrap: nowrap;
}

.drag-area {
    min-height: 200px;
    outline: 1px dashed;
}
</style>
