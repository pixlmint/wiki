<template>
    <div class="board-list">
        <h3>{{ list.meta.title }}</h3>
        <draggable class="items-list" @change="updateList" :list="cards" group="board" itemKey="name">
            <template #item="{element, index}">
                <el-card class="item" shadow="hover">
                    {{ element.meta.title }} {{ index }}
                </el-card>
            </template>
            <template #footer>
                <el-card v-show="addingItem">
                    <el-input ref="addItemInput" v-on:keyup.enter="addItem" v-model="newItemText"></el-input>
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

<script lang="ts">
import {defineComponent, toRaw} from "vue";
import draggable from "vuedraggable";
import {useBoardStore} from "@/src/stores/board";

export default defineComponent({
    name: "List",
    components: {
        draggable,
    },
    props: {
        list: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            addingItem: false,
            newItemText: "",
            boardStore: useBoardStore(),
        }
    },
    created() {
        console.log(toRaw(this.list));
        if (this.list.children === null) {
            this.list.children = {};
        }
    },
    computed: {
        cards() {
            if (this.list.children === null) {
                return [];
            }
            return Object.values(this.list.children);
        }
    },
    methods: {
        updateList(event: Event) {
            if ('added' in event) {
                console.log('handling added event');
                const newCard = event.added.element;
                this.list.children[newCard.id] = newCard;
                this.boardStore.moveCard(this.list.meta.uid, newCard.meta.uid);
            } else if ('removed' in event) {
                console.log('handling removed event', event);
                delete this.list.children[event.removed.element.id];
            } else {
                console.log('I don\'t know what to do with this event', event);
            }
        },
        toggleAddItem: function () {
            this.addingItem = true;
        },
        addItem: function () {
            this.boardStore.createListItem(this.list.id, this.newItemText).then((response: Response) => {
                this.newItemText = "";
                this.addingItem = false;
                this.list.children = response.data.list.children;
            });
        },
    }
});
</script>