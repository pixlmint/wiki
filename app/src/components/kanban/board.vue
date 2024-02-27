<template>
    <div class="board">
        <list v-if="boardLoaded" v-for="list in boardLists" :key="list.id" :list="list"></list>
        <div class="board-list">
            <el-input ref="addItemInput" v-if="isAddingList" v-on:keyup.enter="addList"
                      v-model="newListName"></el-input>
            <el-button @click="toggleAddList">
                <pm-icon icon="plus"></pm-icon>
            </el-button>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import List from "@/src/components/kanban/list.vue";
import {useWikiStore} from "@/src/stores/wiki";
import {useBoardStore} from "@/src/stores/board";
import {useMainStore} from "@/src/stores/main";

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
            mainStore: useMainStore(),
            boardLoaded: false,
            enabled: true,
            dragging: false,
            isAddingList: false,
            newListName: null,
        }
    },
    created() {
        this.boardStore.loadBoard(this.boardId).then(() => {
            this.boardLoaded = true;
            this.mainStore.setTitle(this.boardStore.safeCurrentBoard.meta.title);
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
        addList() {
            if (this.newListName === null) {
                throw 'List name cannot be null';
            }
            this.boardStore.createList(this.boardId, this.newListName).then(() => {
                this.isAddingList = false;
                this.newListName = null;
            });
        },
        toggleAddList() {
            this.isAddingList = true;
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

.board-list {
    width: 300px;
    overflow-y: auto;
    max-height: 100%;
    margin: 10px;
    padding: 20px;
    flex-shrink: 0;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-bg-secondary);
}

.items-list {
    min-height: 200px;

    .item {
        margin-bottom: 10px;
        cursor: pointer;
    }
}
</style>
