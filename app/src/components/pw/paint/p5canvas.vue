<template>
    <div>
        <el-row :gutter="2" class="controls">
            <el-col :span="2" v-for="(tool, index) in tools">
                <el-button @click="toggleActiveTool(tool, index)">
                    <pw-icon :icon="tool.icon"></pw-icon>
                </el-button>
            </el-col>
            <el-col :span="12">
                <el-row :gutter="2">
                    <template v-for="(tool, index) in tools">
                        <el-col :span="4" v-show="selectedTool === index" v-if="tool instanceof DrawTool">
                            <el-select v-model="tool.selectedColorIndex" placeholder="Stroke Color">
                                <el-option
                                    v-for="(color, cIndex) in tool.selectableColors"
                                    :key="cIndex"
                                    :label="color.name"
                                    :value="cIndex"
                                    :style="'color: ' + color.hex"
                                />
                            </el-select>
                        </el-col>
                        <el-col :span="4" v-show="selectedTool === index"
                                v-if="tool instanceof DrawTool || tool instanceof EraserTool">
                            <el-select v-model="tool.selectedWeightIndex" placeholder="Stroke Weight">
                                <el-option
                                    v-for="(weight, wIndex) in tool.selectableWeights"
                                    :key="wIndex"
                                    :label="weight"
                                    :value="wIndex"
                                />
                            </el-select>
                        </el-col>
                    </template>
                </el-row>
            </el-col>
            <el-col :span="4">
                <el-button @click="save">
                    <pw-icon icon="save"></pw-icon>
                </el-button>
            </el-col>
        </el-row>
        <div class="canvas" ref="canvasContainer"></div>
    </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, defineProps, computed, onBeforeUnmount, defineEmits} from 'vue';
import p5 from 'p5';
import PwIcon from "@/src/components/pw/icon.vue";

const canvasContainer = ref(null);

const props = defineProps({
    height: String,
    width: String,
});

let myP5: p5;
let isDrawing = false;
let pointerType = "";

let lastPoint: p5.Vector;
let currentPoint: p5.Vector;
let currentPath: { x: number, y: number, speed: number }[] = [];

const emit = defineEmits();

const save = () => {
    const imageBase64 = myP5.canvas.toDataURL('image/jpeg');
    emit('save', imageBase64);
}

interface Tool {
    name: String,
    icon: String,
    modifyFunction: Function,
}

interface StrokeColor {
    name: String,
    hex: String,
}

interface TemporaryModificationTool {
    tempModifyFunction: Function,
}

interface ColorSelectableTool {
    selectableColors: StrokeColor[],
    selectedColorIndex: number,
}

interface WeightSelectableTool {
    selectableWeights: number[],
    selectedWeightIndex: number,
}

interface DrawSettings {
    selectedTool: Tool,
    selectedStrokeColor: StrokeColor,
}

class BaseTool implements Tool {
    name: String;
    icon: String;
    modifyFunction: Function;

    constructor(name: String, icon: String, modifyFunction: Function) {
        this.name = name;
        this.icon = icon;
        this.modifyFunction = modifyFunction;
    }
}

const colorBlack = {
    name: 'Black',
    hex: "#000",
} as StrokeColor

const colorBlue = {
    name: 'Blue',
    hex: "#3d41b3",
} as StrokeColor

const colorGreen = {
    name: 'Green',
    hex: "#0d721c",
} as StrokeColor

const colorRed = {
    name: 'Red',
    hex: "#cc2e2e",
} as StrokeColor

const hColorYellow = {
    name: 'Yellow',
    hex: '#FAFF607C'
} as StrokeColor

const hColorGreen = {
    name: 'Green',
    hex: '#60FF857C'
} as StrokeColor

const hColorPurple = {
    name: 'Purple',
    hex: '#9A60FF7C'
} as StrokeColor


const t = ref({
    toolIndex: 0,
});

const selectedTool = computed({
    get() {
        return t.value.toolIndex;
    },
    set(newValue: number) {
        t.value.toolIndex = newValue;
    }
})

class DrawTool extends BaseTool implements ColorSelectableTool, WeightSelectableTool, TemporaryModificationTool {
    selectableColors: StrokeColor[];
    selectedColorIndex: number;
    selectableWeights: number[];
    selectedWeightIndex: number;
    tempModifyFunction: Function;

    constructor(name: String, icon: String, modifyFunction: Function, selectableColors: StrokeColor[], selectableWeights: number[], tempModifyFunction: Function) {
        super(name, icon, modifyFunction);
        this.selectableColors = selectableColors;
        this.selectableWeights = selectableWeights;
        this.selectedColorIndex = 0;
        this.selectedWeightIndex = 0;
        this.tempModifyFunction = tempModifyFunction;
    }
}

class EraserTool extends BaseTool implements WeightSelectableTool {
    selectableWeights: number[];
    selectedWeightIndex: number;

    constructor(name: String, icon: String, modifyFunction: Function, selectableWeights: number[]) {
        super(name, icon, modifyFunction);
        this.selectableWeights = selectableWeights;
        this.selectedWeightIndex = 0;
    }
}

const drawTempStroke = (sketch: p5.Graphics, tool: DrawTool) => {
    console.log('drawTempStroke');
    temporaryBuffer.noErase();
    temporaryBuffer.noFill();
    temporaryBuffer.stroke(tool.selectableColors[tool.selectedColorIndex].hex);
    temporaryBuffer.strokeWeight(tool.selectableWeights[tool.selectedWeightIndex]);
    temporaryBuffer.line(lastPoint.x, lastPoint.y, currentPoint.x, currentPoint.y);
    lastPoint.set(currentPoint.x, currentPoint.y);
    sketch.image(temporaryBuffer, 0, 0);
}

const drawStroke = (sketch: any, tool: DrawTool) => {
    sketch.noErase();
    sketch.noFill();
    sketch.stroke(tool.selectableColors[tool.selectedColorIndex].hex);
    sketch.beginShape();
    for (let i = 0; i < currentPath.length; i++) {
        const p = currentPath[i]
        let weight = sketch.map(p.speed, 0, 10, 10, 1);
        weight = sketch.constrain(weight, 1, 2);
        sketch.strokeWeight(tool.selectableWeights[tool.selectedWeightIndex]);
        if (i === 0 || i === currentPath.length - 1) {
            sketch.vertex(p.x, p.y);
        } else {
            // Calculate control points for Bezier curve
            let controlPoints = calculateControlPoints(currentPath, i); // Implement this function
            sketch.bezierVertex(controlPoints.cx1, controlPoints.cy1, controlPoints.cx2, controlPoints.cy2, p.x, p.y);
        }
    }
    sketch.endShape();
    currentPath = [];
}

const calculateControlPoints = (path: object[], index: number) => {
    // Get the current point, and its immediate neighbors
    const p0 = index > 0 ? path[index - 1] : path[0];
    const p1 = path[index];
    const p2 = index < path.length - 1 ? path[index + 1] : p1;

    // Calculate midpoints
    const m0 = {x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2};
    const m1 = {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};

    // Calculate control points
    const l0 = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
    const l1 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const alpha = l0 / (l0 + l1);
    const controlPoint = {x: m1.x + (m0.x - m1.x) * alpha, y: m1.y + (m0.y - m1.y) * alpha};

    // Return control points
    return {
        cx1: controlPoint.x,
        cy1: controlPoint.y,
        cx2: controlPoint.x,
        cy2: controlPoint.y
    };
}

const modeErase = new EraserTool("Erase", "eraser", (sketch: any) => {
    if (currentPath.length > 0) {
        sketch.erase();
        sketch.strokeWeight(modeErase.selectableWeights[modeErase.selectedWeightIndex]); // Set desired eraser size
        // Apply eraser to each point in the current path
        for (let p of currentPath) {
            sketch.point(p.x, p.y);
        }
    }
    currentPath = [];
}, [5, 10, 20, 30]);

const modeDraw = new DrawTool("Draw", "pencil", drawStroke, [colorBlack, colorBlue, colorGreen, colorRed], [1, 2, 5], drawTempStroke);
const modeHighlight = new DrawTool("Highlight", "highlighter", drawStroke, [hColorYellow, hColorGreen, hColorPurple], [10, 20, 50], drawTempStroke);

const tools = [modeDraw, modeHighlight, modeErase];

const settings = ref({
    selectedTool: modeDraw,
    selectedStrokeColor: colorBlack,
} as DrawSettings);

const toggleActiveTool = (tool: Tool, index: number) => {
    console.log(tool);
    settings.value.selectedTool = tool;
    t.value.toolIndex = index;
}

onMounted(() => {
    initP5();
    document.body.classList.add('selectDisabled');
});

onBeforeUnmount(() => {
    console.log('called unmount');
    document.body.classList.remove('selectDisabled');
    const canvas = canvasContainer.value as HTMLElement;

    canvas.removeEventListener("pointermove", pointerMoveEvent);
    canvas.removeEventListener("pointerdown", pointerDownEvent);
    window.removeEventListener("pointerup", pointerUpEvent);
    canvas.removeEventListener("pointerleave", pointerUpEvent);

    //canvas.removeEventListener("mousedown", pointerDownEvent);
    //window.removeEventListener("mouseleave", pointerUpEvent);
    //canvas.removeEventListener("mousemove", pointerMoveEvent);

    canvas.removeEventListener('touchstart', killDefaultBehavior);
    canvas.removeEventListener('touchmove', killDefaultBehavior);
    canvas.removeEventListener('touchend', killDefaultBehavior);
})

let temporaryBuffer: p5.Graphics;

const initP5 = function () {
    if (typeof myP5 !== 'undefined') {
        console.log('p5 has already been initialized');
        return;
    }
    const canvas = canvasContainer.value as HTMLElement;
    myP5 = new p5((sketch) => {
        sketch.setup = () => {
            sketch.createCanvas(props.width, props.height - 100);
            sketch.background(255);
            sketch.frameRate(120);
            lastPoint = sketch.createVector(sketch.mouseX, sketch.mouseY);
            temporaryBuffer = sketch.createGraphics(props.width, props.height - 100);
        };
        sketch.draw = () => {
            if (isDrawing) {
                if (instanceOfTemporaryModificationTool(settings.value.selectedTool)) {
                    settings.value.selectedTool.tempModifyFunction(sketch, settings.value.selectedTool);
                } else {
                    settings.value.selectedTool.modifyFunction(sketch, settings.value.selectedTool);
                }
            }
        };
    }, canvas);

    canvas.addEventListener("pointermove", pointerMoveEvent);
    canvas.addEventListener("pointerdown", pointerDownEvent);
    window.addEventListener("pointerup", pointerUpEvent);
    canvas.addEventListener("pointerleave", pointerUpEvent);

    // canvas.addEventListener("mousedown", pointerDownEvent);
    // window.addEventListener("mouseup", pointerUpEvent);
    // window.addEventListener("mousemove", pointerMoveEvent);

    canvas.addEventListener('touchstart', killDefaultBehavior);
    canvas.addEventListener('touchmove', killDefaultBehavior);
    canvas.addEventListener('touchend', killDefaultBehavior);

    console.log('p5 initialized');
}

const instanceOfTemporaryModificationTool = (obj: any): obj is TemporaryModificationTool => {
    return 'tempModifyFunction' in obj;
}

const pointerMoveEvent = event => {
    if (pointerType === "pen" || pointerType === "mouse") {
        baseMoveEvent(event);
    }
}

const baseMoveEvent = (event: PointerEvent) => {
    if (isDrawing) {
        console.log(event);
        const mX = event.offsetX;
        const mY = event.offsetY;
        const speed = myP5.dist(mX, mY, lastPoint.x, lastPoint.y);
        currentPath.push({
            x: mX,
            y: mY,
            speed: speed,
        });
        currentPoint = myP5.createVector(mX, mY);
        event.preventDefault();
    }
}

const pointerDownEvent = (event: PointerEvent) => {
    pointerType = event.pointerType;
    if (pointerType === "pen" || pointerType === "mouse") {
        console.log(event);
        isDrawing = true;
        currentPath = [];
        const mX = event.offsetX;
        const mY = event.offsetY;
        lastPoint.set(mX, mY);
        currentPoint = myP5.createVector(mX, mY);
        event.preventDefault();
    }
}

const pointerUpEvent = (event: PointerEvent) => {
    currentPath = [];
    console.log(event);
    isDrawing = false;
}

const killDefaultBehavior = event => {
    event.preventDefault();
}
</script>

<style scoped lang="scss">
.canvas {
    touch-action: none;
    user-select: none;
    border: 2px solid black;
}

.controls {
    height: 100px;
}
</style>

<style>
.selectDisabled, .canvas {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
}
</style>
