<template>
    <div class="board-list">
        <h3>{{ list.name }}</h3>
        <draggable class="items-list" :list="list.items" group="board" itemKey="name">
            <template #item="{element, index}">
                <el-card class="item" shadow="hover">
                    {{ element.name }} {{ index }}
                </el-card>
            </template>
            <template #footer>
                <el-card v-show="addingItem">
                    <el-input ref="addItemInput" v-on:keyup.enter="addItem" v-model="newItemText"></el-input>
                </el-card>
                <el-row justify="end">
                    <el-col :span="4">
                        <el-button @click="toggleAddItem"><pw-icon icon="plus"></pw-icon></el-button>
                    </el-col>
                </el-row>
            </template>
        </draggable>
    </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import draggable from "vuedraggable";
import PwIcon from "@/src/components/pw/icon.vue";

export default defineComponent({
    name: "List",
    components: {
        PwIcon,
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