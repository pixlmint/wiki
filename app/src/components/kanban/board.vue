<template>
    <div class="board">
        <list v-if="data.boardLoaded" v-for="list in boardLists" :key="list.id" :list="list"></list>
        <div class="board-list">
            <div class="d-flex justify-content-end">
                <el-input ref="addItemInput" v-show="data.isAddingList" v-on:keyup.esc="cancelAddList" v-on:keyup.enter="addList"
                          v-model="data.newListName"></el-input>
                <el-button v-show="!data.isAddingList" @click="toggleAddList">
                    <pm-icon icon="plus"></pm-icon>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {ref, reactive, computed} from "vue";
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
    const lists = [];
    const listIds = boardStore.safeCurrentBoard.meta.board.lists;
    const childrenObj = boardStore.safeCurrentBoard.children;
    if (childrenObj === null || Object.keys(childrenObj).length === 0) {
        return lists;
    }
    const children = Object.values(childrenObj);
    for (let i = 0; i < listIds.length; i++) {
        for (let x = 0; x < children.length; x++) {
            if (listIds[i] === children[x].id) {
                lists.push(children[x]);
            }
        }
    }

    return lists;
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
const cancelAddList = function () {
    data.isAddingList = false;
    data.newListName = null;
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
    max-height: 90vh;
    gap: 1rem;
    overflow-x: auto;
    flex-wrap: nowrap;
    align-items: flex-start;
}

.drag-area {
    min-height: 200px;
    outline: 1px dashed;
}
</style>
