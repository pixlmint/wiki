<template>
    <div class="board">
        <list v-if="data.boardLoaded" v-for="list in boardLists" :key="list.id" :list="list"></list>
        <div class="board-list">
            <el-input ref="addItemInput" v-show="data.isAddingList" v-on:keyup.enter="addList"
                      v-model="data.newListName"></el-input>
            <el-button @click="toggleAddList">
                <pm-icon icon="plus"></pm-icon>
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {ref, defineProps, reactive, computed} from "vue";
import List from "@/src/components/kanban/list.vue";
import {useWikiStore} from "@/src/stores/wiki";
import {useBoardStore} from "@/src/stores/board";
import {useMainStore} from "@/src/stores/main";

const addItemInput = ref(null);

const props = defineProps({
    boardId: {
        type: String,
        required: true,
    },
});
const wikiStore = useWikiStore();
const boardStore = useBoardStore();
const mainStore = useMainStore();

const data = reactive({
    boardLoaded: false,
    enabled: true,
    dragging: false,
    isAddingList: false,
    newListName: null,
});

// created
boardStore.loadBoard(props.boardId).then(() => {
    data.boardLoaded = true;
    mainStore.setTitle(boardStore.safeCurrentBoard.meta.title);
});
const boardLists = computed(() => {
    return boardStore.safeCurrentBoard.children;
});

const log = function (event: Event) {
    console.log(event)
}
const addList = function () {
    if (data.newListName === null) {
        throw 'List name cannot be null';
    }
    boardStore.createList(props.boardId, data.newListName).then(() => {
        data.isAddingList = false;
        data.newListName = null;
    });
}
const toggleAddList = function () {
    data.isAddingList = true;
    if (addItemInput.value) {
        addItemInput.value.focus();
    }
}

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
