<template>
    <div>
        <div class="drawing-toolbar">
            <div class="drawing-toolbar-section top-section">
                <div class="drawing-toolbar-tools d-flex gap-1">
                    <div v-for="(tool, index) in tools">
                        <el-button @click="toggleActiveTool(tool, index)">
                            <pw-icon :icon="tool.icon"></pw-icon>
                        </el-button>
                    </div>
                    <el-divider direction="vertical"></el-divider>
                    <div v-for="(mode, index) in modes">
                        <el-button @click="toggleActiveMode(mode, index)">
                            <pw-icon :icon="mode.icon"></pw-icon>
                        </el-button>
                    </div>
                </div>
                <div class="drawing-toolbar-actions">
                    <el-button @click="debug.enabled = !debug.enabled">
                        <pw-icon icon="bug"></pw-icon>
                    </el-button>
                    <el-button @click="save">
                        <pw-icon icon="save"></pw-icon>
                    </el-button>
                </div>
            </div>
            <div class="drawing-toolbar-section">
                <template v-for="(tool, index) in tools">
                    <div v-show="selectedTool === index" v-if="tool instanceof DrawTool">
                        <el-select v-model="tool.selectedColorIndex" placeholder="Stroke Color">
                            <el-option
                                v-for="(color, cIndex) in tool.selectableColors"
                                :key="cIndex"
                                :label="color.name"
                                :value="cIndex"
                                :style="'color: ' + color.hex"
                            />
                        </el-select>
                    </div>
                    <div v-show="selectedTool === index"
                         v-if="tool instanceof DrawTool || tool instanceof EraserTool">
                        <el-select v-model="tool.selectedWeightIndex" placeholder="Stroke Weight">
                            <el-option
                                v-for="(weight, wIndex) in tool.selectableWeights"
                                :key="wIndex"
                                :label="weight"
                                :value="wIndex"
                            />
                        </el-select>
                    </div>
                </template>
            </div>
        </div>
        <svg class="d3-canvas" ref="svgContainer" :width="props.width" :height="props.height - 100"></svg>
        <div v-if="debug.enabled" class="paint-debug">
            <div>Mouse Position: {{ debug.mousePosition.x }}, {{ debug.mousePosition.y }}</div>
            <div>Pointer Type: {{ pointerType }}</div>
            <div>Paths Count: {{ paths.length }}</div>
            <div>Current Path: {{ currentPath }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import * as d3 from 'd3';
import PwIcon from "@/src/components/pw/icon.vue";
import {Vector, PaintStroke, PaintStrokePoint, Drawing, DrawingMode} from "@/src/contracts/Canvas";
import {BaseType, Selection} from "d3";

const svgContainer = ref(null);

const props = defineProps({
    height: String,
    width: String,
});

let svgCanvas: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
let isDrawing = false;
let pointerType = "";

let lastPoint: Vector;
let currentPoint: Vector;
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
    reDrawSvg(paths, svgCanvas);
    let svgData = svgCanvas.html();
    svgData = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + svgCanvas.attr('width') + '" height="' + svgCanvas.attr('height') + '">' + svgData + '</svg>';
    const drawing = {
        svg: svgData,
        data: {
            paths: paths,
            meta: {
                width: parseInt(props.width),
                height: parseInt(props.height),
            },
        }
    } as Drawing;
    emit('save', drawing);
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
    selectedMode: DrawingMode,
    selectedStrokeColor: StrokeColor,
}

class BaseDrawingMode implements DrawingMode {
    name: String;
    icon: String;
    pointsTransformer: Function;
    appendObject: (stroke: PaintStroke, canvas: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) => Selection<SVGPathElement, PaintStroke, BaseType, unknown>;

    constructor(name: String, icon: String, pointsTransformer: Function, appendObject: (stroke: PaintStroke) => Selection<SVGPathElement, PaintStroke, BaseType, unknown>) {
        this.name = name;
        this.icon = icon;
        this.pointsTransformer = pointsTransformer;
        this.appendObject = appendObject;
    }
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

class BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;

    constructor() {
        this.minX = Number.MAX_VALUE;
        this.minY = Number.MAX_VALUE;
        this.maxX = Number.MIN_VALUE;
        this.maxY = Number.MIN_VALUE;
    }

    update(point: PaintStrokePoint): void {
        this.minX = Math.min(this.minX, point.x);
        this.minY = Math.min(this.minY, point.y);
        this.maxX = Math.max(this.maxX, point.x);
        this.maxY = Math.max(this.maxY, point.y);
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
    modeIndex: 0,
});

const selectedTool = computed({
    get() {
        return t.value.toolIndex;
    },
    set(newValue: number) {
        t.value.toolIndex = newValue;
    }
})

const drawTempStroke = (sketch: any, tool: DrawTool) => {
    sketch.append('line')
        .style('stroke', tool.selectableColors[tool.selectedColorIndex].hex)
        .style('stroke-width', tool.selectableWeights[tool.selectedWeightIndex])
        .attr('x1', lastPoint.x)
        .attr('y1', lastPoint.y)
        .attr('x2', currentPoint.x)
        .attr('y2', currentPoint.y);


    lastPoint = {x: currentPoint.x, y: currentPoint.y};
}

const paintStrokes = (paths: PaintStroke[], sketch: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) => {
    currentPath.points = settings.value.selectedMode.pointsTransformer(currentPath.points);
    if (!(settings.value.selectedTool instanceof EraserTool)) {
        paths.push(currentPath);
    }
    reDrawSvg(paths, sketch);
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

const reDrawSvg = (data: PaintStroke[], canvas: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) => {
    canvas.selectAll('*').remove();

    data.forEach((stroke: PaintStroke) => {
        const mode = stroke.drawingMode;
        const drawnObject = mode.appendObject(stroke, canvas);

        drawnObject
            .attr("stroke-width", stroke.baseWeight)
            .attr("fill", "none")
            .attr("stroke", stroke.color);
    });
}

const modeFreehand = new BaseDrawingMode('Freehand', 'hand', (points: PaintStrokePoint[]) => {
    return points;
}, (stroke: PaintStroke, canvas: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) => {
    const lineGenerator = d3.line<PaintStrokePoint>()
        .x((d: PaintStrokePoint) => {
            return d.x
        })
        .y((d: PaintStrokePoint) => {
            return d.y
        })
        .curve(d3.curveBasis);

    return canvas
        .append("path")
        .datum(stroke.points)
        .attr("d", lineGenerator);
});

const modeRectangle = new BaseDrawingMode('Rectangle', 'vector-square', (points: PaintStrokePoint[]) => {
    if (points.length < 2) {
        throw "At least 2 points required";
    }

    const firstPoint = points[0];
    let biggestX = 0;
    let biggestY = 0;
    points.forEach((point: PaintStrokePoint) => {
        if (point.x > biggestX) {
            biggestX = point.x;
        }
        if (point.y > biggestY) {
            biggestY = point.y;
        }
    });

    return [
        firstPoint,
        {
            x: biggestX,
            y: firstPoint.y,
        } as PaintStrokePoint,
        {
            x: biggestX,
            y: biggestY
        } as PaintStrokePoint,
        {
            x: firstPoint.x,
            y: biggestY,
        } as PaintStrokePoint,
    ];
}, (point: PaintStroke, canvas: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) => {
    const bb = new BoundingBox();
    point.points.forEach((point: PaintStrokePoint) => bb.update(point));

    console.log(bb);
    const height = bb.maxY - bb.minY;
    const width = bb.maxX - bb.minX;
    return canvas.append('rect')
        .attr('x', bb.minX)
        .attr('y', bb.minY)
        .attr('height', height)
        .attr('width', width);
});

const modeCircle = new BaseDrawingMode("Circle", "circle", (points: PaintStrokePoint[]) => {
    const bb = new BoundingBox();
    points.forEach((point: PaintStrokePoint) => {
        bb.update(point);
    });
    return [
        {
            x: bb.maxX,
            y: bb.maxY,
        } as PaintStrokePoint,
        {
            x: bb.minX,
            y: bb.minY,
        } as PaintStrokePoint,
    ];
}, (point: PaintStroke, canvas: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) => {
    const bb = new BoundingBox();
    point.points.forEach((point: PaintStrokePoint) => {
        bb.update(point);
    });

    const center = {
        x: (bb.maxX + bb.minX) / 2,
        y: (bb.maxY + bb.minY) / 2,
    } as Vector

    const radius = bb.maxX - center.x;

    return canvas.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', radius);
});

const modeErase = new EraserTool("Erase", "eraser", () => {
}, [2, 30], undefined, (sketch: any, tool: Tool) => {
    paths = eraseStrokes(currentPath);
    reDrawSvg(paths, svgCanvas);
});

const modeDraw = new DrawTool("Draw", "pencil", drawTempStroke, [colorBlack, colorBlue, colorGreen, colorRed], [1, 2, 5], undefined, paintStrokes);
const modeHighlight = new DrawTool("Highlight", "highlighter", drawTempStroke, [hColorYellow, hColorGreen, hColorPurple], [10, 20, 50], undefined, paintStrokes);

const tools = [modeDraw, modeHighlight, modeErase];
const modes = [modeFreehand, modeRectangle, modeCircle];

const settings = ref({
    selectedTool: modeDraw,
    selectedMode: modeFreehand,
    selectedStrokeColor: colorBlack,
} as DrawSettings);

const toggleActiveTool = (tool: Tool, index: number) => {
    console.log(tool);
    settings.value.selectedTool = tool;
    t.value.toolIndex = index;
}

const toggleActiveMode = (mode: DrawingMode, index: number) => {
    console.log(mode);
    settings.value.selectedMode = mode;
    t.value.modeIndex = index;
}

onMounted(() => {
    initDrawing();
    document.body.classList.add('selectDisabled');
});

const onResize = (event: Event) => {
    console.log('resized'); // TODO: implement onresize
}

onBeforeUnmount(() => {
    if (typeof svgCanvas === 'undefined') {
        console.log('already unmounted');
        return;
    }
    console.log('called unmount');
    document.body.classList.remove('selectDisabled');

    const c: HTMLElement | Element | null = document.querySelector('svg.d3-canvas');

    window.removeEventListener('resize', onResize);

    c.removeEventListener("pointermove", pointerMoveEvent);
    c.removeEventListener("pointerdown", pointerDownEvent);
    window.removeEventListener("pointerup", pointerUpEvent);
    c.removeEventListener("pointerleave", pointerUpEvent);

    c.removeEventListener('touchstart', killDefaultBehavior);
    c.removeEventListener('touchmove', killDefaultBehavior);
    c.removeEventListener('touchend', killDefaultBehavior);
})

const initDrawing = function () {
    if (typeof svgCanvas !== 'undefined') {
        console.log('canvas has already been initialized');
        return;
    }
    svgCanvas = d3.select('svg.d3-canvas');

    console.log(svgCanvas);

    const c: HTMLElement | Element | null = document.querySelector('svg.d3-canvas');

    c.addEventListener("pointermove", pointerMoveEvent);
    c.addEventListener("pointerdown", pointerDownEvent);
    window.addEventListener("pointerup", pointerUpEvent);
    c.addEventListener("pointerleave", pointerUpEvent);

    c.addEventListener('touchstart', killDefaultBehavior);
    c.addEventListener('touchmove', killDefaultBehavior);
    c.addEventListener('touchend', killDefaultBehavior);
    c.addEventListener("pointermove", (event: PointerEvent) => {
        debug.value.mousePosition.x = event.offsetX;
        debug.value.mousePosition.y = event.offsetY;
    });

    window.addEventListener('resize', onResize);

    console.log('drawing initialized');
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
        currentPoint = {x: mX, y: mY};
        settings.value.selectedTool.drawFunction(svgCanvas, settings.value.selectedTool);
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
            settings.value.selectedTool.startModifyFunction(svgCanvas, settings.value.selectedTool);
        }
        isDrawing = true;
        const mX = event.offsetX;
        const mY = event.offsetY;
        lastPoint = {x: mX, y: mY};
        currentPoint = {x: mX, y: mY};
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
    currentPath.drawingMode = settings.value.selectedMode;
    if (settings.value.selectedTool.endModifyFunction !== undefined) {
        settings.value.selectedTool.endModifyFunction(paths, svgCanvas);
    }
    isDrawing = false;
}

const killDefaultBehavior = (event: Event) => {
    event.preventDefault();
}
</script>

<style scoped lang="scss">
.drawing-toolbar {
    width: 80%;

    .drawing-toolbar-section {
        display: flex;
        width: 100%;
        margin-bottom: 0.5rem;
        gap: 5px;

        &.top-section {
            justify-content: space-between;
        }
    }
}

svg.d3-canvas {
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
