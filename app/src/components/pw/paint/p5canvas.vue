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
                <el-button @click="debug.enabled = !debug.enabled">
                    <pw-icon icon="bug"></pw-icon>
                </el-button>
                <el-button @click="save">
                    <pw-icon icon="save"></pw-icon>
                </el-button>
            </el-col>
        </el-row>
        <div class="canvas" ref="canvasContainer"></div>
        <div v-if="debug.enabled" class="paint-debug">
            <div>Mouse Position: {{ debug.mousePosition.x }}, {{ debug.mousePosition.y }}</div>
            <div>Pointer Type: {{ pointerType }}</div>
            <div>Paths Count: {{ paths.length }}</div>
            <div>Current Path: {{ currentPath }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, defineEmits, defineProps, onBeforeUnmount, onMounted, ref} from 'vue';
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
let currentPath: PaintStroke;
let paths: PaintStroke[] = [];

const emit = defineEmits();

const debug = ref({
    enabled: false,
    mousePosition: {
        x: 0,
        y: 0,
    },
});

const save = () => {
    const imageBase64 = myP5.canvas.toDataURL('image/jpeg');
    emit('save', imageBase64);
}

interface PaintStroke {
    points: PaintStrokePoint[],
    color: String,
    baseWeight: number,
}

interface PaintStrokePoint {
    x: number,
    y: number,
    speed: number,
    pressure?: number,
}

interface Tool {
    name: String,
    icon: String,
    drawFunction: Function,
    startModifyFunction?: Function,
    endModifyFunction?: Function,
}

interface StrokeColor {
    name: String,
    hex: String,
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
    drawFunction: Function;
    startModifyFunction?: Function;
    endModifyFunction?: Function;

    constructor(name: String, icon: String, drawFunction: Function, startModifyFunction?: Function, endModifyFunction?: Function) {
        this.name = name;
        this.icon = icon;
        this.drawFunction = drawFunction;
        this.startModifyFunction = startModifyFunction;
        this.endModifyFunction = endModifyFunction;
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

class DrawTool extends BaseTool implements ColorSelectableTool, WeightSelectableTool {
    selectableColors: StrokeColor[];
    selectedColorIndex: number;
    selectableWeights: number[];
    selectedWeightIndex: number;

    constructor(name: String, icon: String, drawFunction: Function, selectableColors: StrokeColor[], selectableWeights: number[], startModifyFunction?: Function, endModifyFunction?: Function) {
        super(name, icon, drawFunction, startModifyFunction, endModifyFunction);
        this.selectableColors = selectableColors;
        this.selectableWeights = selectableWeights;
        this.selectedColorIndex = 0;
        this.selectedWeightIndex = 0;
    }
}

class EraserTool extends BaseTool implements WeightSelectableTool {
    selectableWeights: number[];
    selectedWeightIndex: number;

    constructor(name: String, icon: String, drawFunction: Function, selectableWeights: number[], startModifyFunction?: Function, endModifyFunction?: Function) {
        super(name, icon, drawFunction, startModifyFunction, endModifyFunction);
        this.selectableWeights = selectableWeights;
        this.selectedWeightIndex = 0;
    }
}

const drawTempStroke = (sketch: p5.Graphics, tool: DrawTool) => {
    sketch.noErase();
    sketch.noFill();
    sketch.stroke(tool.selectableColors[tool.selectedColorIndex].hex);
    sketch.strokeWeight(tool.selectableWeights[tool.selectedWeightIndex]);
    sketch.line(lastPoint.x, lastPoint.y, currentPoint.x, currentPoint.y);
    lastPoint.set(currentPoint.x, currentPoint.y);
}

const paintStrokes = (sketch: p5.Graphics, tool: Tool) => {
    if (!(tool instanceof EraserTool)) {
        paths.push(currentPath);
    }
    sketch.background(255);
    sketch.noErase();
    sketch.noFill();
    paths.forEach((stroke: PaintStroke) => {
        sketch.stroke(stroke.color);
        sketch.strokeWeight(stroke.baseWeight);
        sketch.beginShape();
        stroke.points.forEach((p, i) => {
            if (i === 0 || i === stroke.points.length - 1) {
                sketch.vertex(p.x, p.y);
            } else {
                sketch.curveVertex(p.x, p.y);
            }
        });
        sketch.endShape();
    });
}

const myEraseStrokes = (erasePath: PaintStroke) => {
    return paths.flatMap((stroke: PaintStroke) => {
        let splitStrokes: PaintStroke[] = [];

        for (let i = 0; i < stroke.points.length; i++) {
            const currentPoint = stroke.points[i];
            const nextPoint = stroke.points[i + 1];

            if (nextPoint) {
                let intersections: any[] = [];

                erasePath.points.forEach((eraserPoint: PaintStrokePoint) => {
                    intersections.push(...findLineCircleIntersections(
                        currentPoint, nextPoint, eraserPoint, erasePath.baseWeight
                    ));
                });
                intersections = intersections.filter((p: p5.Vector) =>
                    p.x >= Math.min(currentPoint.x, nextPoint.x) &&
                    p.x <= Math.max(currentPoint.x, nextPoint.x) &&
                    p.y >= Math.min(currentPoint.y, nextPoint.y) &&
                    p.y <= Math.max(currentPoint.y, nextPoint.y)
                );
                console.table(intersections);
            }
        }
    });
}

const distanceBetween = (point1: PaintStrokePoint, point2: PaintStrokePoint) => {
    return Math.sqrt(
        Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
    );
}

const isStrokeErased = (stroke: PaintStroke, eraserStroke: PaintStroke) => {
    for (let i = 0; i < stroke.points.length; i++) {
        const currentPoint = stroke.points[i];

        // Check if any eraser point overlaps with a stroke point
        const pointErased = eraserStroke.points.some(eraserPoint =>
            distanceBetween(currentPoint, eraserPoint) <= eraserStroke.baseWeight
        );

        if (pointErased) {
            return true;
        }

        // Check if any eraser point overlaps with a line between stroke points
        if (i < stroke.points.length - 1) {
            const nextPoint = stroke.points[i + 1];
            const lineErased = eraserStroke.points.some(eraserPoint =>
                isLineSegmentIntersectingCircle(currentPoint, nextPoint, eraserPoint, eraserStroke.baseWeight)
            );

            if (lineErased) {
                return true;
            }
        }
    }
    return false;
}

const eraseStrokes = (erasePath: PaintStroke) => {
    return paths.filter(stroke => !isStrokeErased(stroke, erasePath));
}

const isLineSegmentIntersectingCircle = (p0: PaintStrokePoint, p1: PaintStrokePoint, circleCenter: PaintStrokePoint, radius: number) => {
    // Line segment vector
    const lineVec = {x: p1.x - p0.x, y: p1.y - p0.y};

    // Vector from line start to circle center
    const toCircleVec = {x: circleCenter.x - p0.x, y: circleCenter.y - p0.y};

    // Project toCircleVec onto lineVec
    const lengthLineVec = Math.sqrt(lineVec.x * lineVec.x + lineVec.y * lineVec.y);
    const dotProduct = (toCircleVec.x * lineVec.x + toCircleVec.y * lineVec.y) / lengthLineVec;
    const closestPointOnLine = {
        x: p0.x + (dotProduct / lengthLineVec) * lineVec.x,
        y: p0.y + (dotProduct / lengthLineVec) * lineVec.y
    };

    // Check if closest point is within line segment bounds
    const isWithinSegment = dotProduct >= 0 && dotProduct <= lengthLineVec;

    // Distance from circle center to closest point on line
    const distanceToLine = Math.sqrt(
        (circleCenter.x - closestPointOnLine.x) * (circleCenter.x - closestPointOnLine.x) +
        (circleCenter.y - closestPointOnLine.y) * (circleCenter.y - closestPointOnLine.y)
    );

    return isWithinSegment && distanceToLine <= radius;
}

const modeErase = new EraserTool("Erase", "eraser", (sketch: any) => {
    if (currentPath.points.length > 0) {
        sketch.erase();
        sketch.strokeWeight(modeErase.selectableWeights[modeErase.selectedWeightIndex]); // Set desired eraser size
        // Apply eraser to each point in the current path
        for (let p of currentPath.points) {
            sketch.point(p.x, p.y);
        }
    }
}, [2, 30], undefined, (sketch: p5.Graphics, tool: Tool) => {
    paths = eraseStrokes(currentPath);
    console.table(paths);
    paintStrokes(sketch, modeErase);
});

const modeDraw = new DrawTool("Draw", "pencil", drawTempStroke, [colorBlack, colorBlue, colorGreen, colorRed], [1, 2, 5], undefined, paintStrokes);
const modeHighlight = new DrawTool("Highlight", "highlighter", drawTempStroke, [hColorYellow, hColorGreen, hColorPurple], [10, 20, 50], undefined, paintStrokes);

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
    myP5 = new p5((sketch: p5.Graphics) => {
        sketch.setup = () => {
            sketch.createCanvas(props.width, props.height - 100);
            sketch.background(255);
            sketch.frameRate(120);
            lastPoint = sketch.createVector(sketch.mouseX, sketch.mouseY);
            temporaryBuffer = sketch.createGraphics(props.width, props.height - 100);
        };
        sketch.draw = () => {
            if (isDrawing) {
                settings.value.selectedTool.drawFunction(sketch, settings.value.selectedTool);
            }
        };
    }, canvas);

    canvas.addEventListener("pointermove", pointerMoveEvent);
    canvas.addEventListener("pointerdown", pointerDownEvent);
    window.addEventListener("pointerup", pointerUpEvent);
    canvas.addEventListener("pointerleave", pointerUpEvent);

    canvas.addEventListener('touchstart', killDefaultBehavior);
    canvas.addEventListener('touchmove', killDefaultBehavior);
    canvas.addEventListener('touchend', killDefaultBehavior);

    if (debug.value.enabled) {
        canvas.addEventListener("pointermove", (event: PointerEvent) => {
            debug.value.mousePosition.x = event.offsetX;
            debug.value.mousePosition.y = event.offsetY;
        });
    }

    console.log('p5 initialized');
}

const pointerMoveEvent = (event: PointerEvent) => {
    if (pointerType === "pen" || pointerType === "mouse") {
        baseMoveEvent(event);
    }
}

const baseMoveEvent = (event: PointerEvent) => {
    if (isDrawing) {
        const mX = event.offsetX;
        const mY = event.offsetY;
        pushPoint(event);
        currentPoint = myP5.createVector(mX, mY);
        event.preventDefault();
    }
}

const pushPoint = (event: PointerEvent) => {
    currentPath.points.push({
        x: event.offsetX,
        y: event.offsetY,
        speed: 0,
        pressure: event.pressure,
    });
}

const pointerDownEvent = (event: PointerEvent) => {
    pointerType = event.pointerType;
    if (pointerType === "pen" || pointerType === "mouse") {
        if (settings.value.selectedTool.startModifyFunction !== undefined) {
            settings.value.selectedTool.startModifyFunction(myP5, settings.value.selectedTool);
        }
        isDrawing = true;
        const mX = event.offsetX;
        const mY = event.offsetY;
        lastPoint.set(mX, mY);
        currentPoint = myP5.createVector(mX, mY);
        let baseWeight = 1;
        let baseColor = '#000';
        if ('selectableWeights' in settings.value.selectedTool && 'selectedWeightIndex' in settings.value.selectedTool) {
            baseWeight = settings.value.selectedTool.selectableWeights[settings.value.selectedTool.selectedWeightIndex];
        }
        if ('selectableColors' in settings.value.selectedTool && 'selectedColorIndex' in settings.value.selectedTool) {
            baseColor = settings.value.selectedTool.selectableColors[settings.value.selectedTool.selectedColorIndex].hex;
        }
        currentPath = {
            points: [],
            color: baseColor,
            baseWeight: baseWeight,
        };
        pushPoint(event);
        event.preventDefault();
    }
}

const pointerUpEvent = (event: PointerEvent) => {
    if (!isDrawing) {
        return;
    }
    if (settings.value.selectedTool.endModifyFunction !== undefined) {
        settings.value.selectedTool.endModifyFunction(myP5, settings.value.selectedTool);
    }
    isDrawing = false;
}

const killDefaultBehavior = (event: Event) => {
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

.paint-debug {
    position: absolute;
    background-color: rgba(223, 223, 223, 0.33);
    bottom: 0;
    left: 0;
    max-height: 30%;
    overflow-y: scroll;
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
