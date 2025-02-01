<template>
    <div class="labels-editor">
        <div v-for="(label, index) in props.labels" :key="index">
            <CardLabel :label="label"></CardLabel>
        </div>
        <div v-show="data.isAddingLabel">
            <div class="d-flex gap-1">
                <div>
                    <el-input @keydown="inputKeypress" id="card-label-input" v-model="data.newLabelName"></el-input>
                </div>
                <el-color-picker :span="1" v-model="data.newLabelColor"></el-color-picker>
		<el-button @click="newRandomColor">
		    <pm-icon icon="arrow-rotate-right"></pm-icon>
		</el-button>
                <el-button @click="addLabel">
                    <pm-icon icon="check"></pm-icon>
                </el-button>
                <el-button @click="resetInput">
                    <pm-icon icon="xmark"></pm-icon>
                </el-button>
            </div>
        </div>
        <div v-show="!data.isAddingLabel">
            <el-button @click="toggleAddLabel">
                <pm-icon icon="plus"></pm-icon>
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {CardLabel as iCardLabel} from "@/contracts/Kanban";
import {reactive} from "vue";
import {generatePleasingColor, randomizeColor} from "@/helpers/color";
import CardLabel from "@/components/kanban/card-label.vue";

const data = reactive({
    isAddingLabel: false,
    newLabelName: '',
    newLabelColor: '',
});

const toggleAddLabel = function () {
    const randomNewColor = randomColor();
    data.newLabelColor = randomNewColor;
    data.isAddingLabel = true;
    window.setTimeout(function () {
        // @ts-ignore
        document.getElementById('card-label-input').focus();
    }, 50);
}

const props = defineProps({
    labels: {
        type: Array<iCardLabel>,
        required: true,
    }
});

const inputKeypress = function (event: KeyboardEvent) {
    if (event.key !== 'Enter') {
        return;
    }
    addLabel();
    window.setTimeout(function () {
        toggleAddLabel();
    }, 50);
}

const resetInput = function () {
    data.newLabelName = '';
    data.newLabelColor = '';
    data.isAddingLabel = false;
}

const randomColor = function () {
    if (props.labels.length === 0) {
        return generatePleasingColor();
    } else {
        const latestColor = props.labels[props.labels.length - 1].color;
        return randomizeColor(latestColor);
    }
}

const newRandomColor = function () {
    const randomNewColor = randomColor();
    data.newLabelColor = randomNewColor;
}

const addLabel = function () {
    props.labels.push({
        color: data.newLabelColor,
        title: data.newLabelName,
    });
    emit('change', props.labels);
    window.setTimeout(function () {
        resetInput();
    }, 50);
}

const emit = defineEmits(['change']);
</script>

<style lang="scss" scoped>
.labels-editor {
   display: flex;
    width: 100%;
    flex-wrap: wrap;
}
</style>
