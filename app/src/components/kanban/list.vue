<template>
    <div class="board-list">
        <h3>{{ list.meta.title }}</h3>
        <draggable class="items-list" @change="updateList" :list="cards" group="board" itemKey="name">
            <template #item="{element, index}">
                <card :card-data="element" class="item"></card>
            </template>
            <template #footer>
                <el-card v-show="data.addingItem">
                    <el-input ref="addItemInput" v-on:keyup.esc="cancelAddItem" v-on:keyup.enter="addItem" v-model="data.newItemText"></el-input>
                </el-card>
                <el-row justify="end">
                    <el-col :span="4">
                        <el-button @click="toggleAddItem"><pm-icon icon="plus"></pm-icon></el-button>
                    </el-col>
                </el-row>
            </template>
        </draggable>
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
    if ('added' in event) {
        const newCard = event.added.element;
        props.list.children[newCard.id] = newCard;
        boardStore.moveCard(props.list.meta.uid, newCard.meta.uid);
    } else if ('removed' in event) {
        console.log('handling removed event', event);
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
