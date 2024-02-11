<template>
    <div class="board-list">
        <h3>{{ list.meta.title }}</h3>
        <draggable class="items-list" :list="cards" group="board" itemKey="name">
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
        }
    },
    created() {
        console.log(toRaw(this.list));
    },
    computed: {
        cards() {
            return Object.values(this.list.children);
        }
    },
    methods: {
        toggleAddItem: function () {
            this.addingItem = true;
        },
        addItem: function () {
            this.list.items.push({
                name: this.newItemText,
            });
            this.newItemText = "";
            this.addingItem = false;
        },
    }
});
</script>

<style lang="scss" scoped>
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