<template>
    <div class="board-list">
        <h3>{{ list.meta.title }}</h3>
        <draggable :class="{'items-list': true, 'empty-list': cards.length === 0}" @dragstart="emit('startDragging')" @dragend="emit('stopDragging')" @change="updateList" :list="cards" group="board" itemKey="name">
            <template #item="{element, index}">
                <card :card-data="element" class="item"></card>
            </template>
        </draggable>
        <div class="mt-1 d-flex justify-content-end">
            <el-input v-show="data.addingItem" ref="addItemInput" v-on:keyup.esc="cancelAddItem"
                      v-on:keyup.enter="addItem" v-model="data.newItemText"></el-input>
            <div v-show="!data.addingItem">
                <el-button @click="toggleAddItem">
                    <pm-icon icon="plus"></pm-icon>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import draggable from "vuedraggable";
import {useBoardStore} from "@/src/stores/board";
import {AxiosResponse} from "axios";
import {reactive, computed, ref} from "vue";
import Card from "@/src/components/kanban/card.vue";

const props = defineProps({
    list: {
        type: Object,
        required: true,
    }
});

const emit = defineEmits<{
    startDragging: [],
    stopDragging: [],
}>();

const data = reactive({
    addingItem: false,
    newItemText: "",
});

const addItemInput = ref(null);

const boardStore = useBoardStore();

// created
if (props.list.children === null) {
    props.list.children = {};
}

const cards = computed(() => {
    if (props.list.children === null) {
        return [];
    }
    return Object.values(props.list.children);
});


const updateList = function (event: Event) {
    console.log("handling event", event);
    if ('added' in event) {
        const newCard = event.added.element;
        props.list.children[newCard.id] = newCard;
        boardStore.moveCard(props.list.meta.uid, newCard.meta.uid).then(() => {
            boardStore.refreshBoard();
        });
    } else if ('removed' in event) {
        delete props.list.children[event.removed.element.id];
    } else {
        console.log('I don\'t know what to do with this event', event);
    }
}
const toggleAddItem = function () {
    data.addingItem = true;
    if (addItemInput.value) {
        addItemInput.value.focus();
    }
}

const cancelAddItem = function () {
    data.addingItem = false;
    data.newItemText = "";
}

const addItem = function () {
    boardStore.createListItem(props.list.id, data.newItemText).then((response: AxiosResponse) => {
        data.newItemText = "";
        data.addingItem = false;
        props.list.children = response.data.list.children;
    });
}
</script>

<style lang="scss">
.board-list {
    width: 325px;
    max-height: 82vh;
    margin: 10px;
    padding: 5px;
    flex-shrink: 0;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-bg-secondary);
    overflow: auto;

    .items-list {
        max-height: 80%;
        min-height: 50px;
        overflow-y: auto;

        .item {
            margin-bottom: 10px;
            cursor: pointer;
        }
    }
}

.board:not(.draggingCard) .empty-list {
    display: none;
}
</style>
