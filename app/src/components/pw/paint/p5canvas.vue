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
    </el-row>
    <div class="canvas" ref="canvasContainer"></div>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, defineProps, computed, onBeforeUnmount} from 'vue';
import p5 from 'p5';
import PwIcon from "@/src/components/pw/icon.vue";

const canvasContainer = ref(null);

const props = defineProps({
  height: String,
  width: String,
});

let myP5 = null;
let isDrawing = false;
let pointerType = "";

let lastPoint;
let currentPath = [];

interface Tool {
  name: String,
  icon: String,
  modifyFunction: Function,
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

class DrawTool extends BaseTool implements ColorSelectableTool, WeightSelectableTool {
  selectableColors: StrokeColor[];
  selectedColorIndex: number;
  selectableWeights: number[];
  selectedWeightIndex: number;

  constructor(name: String, icon: String, modifyFunction: Function, selectableColors: StrokeColor[], selectableWeights: number[]) {
    super(name, icon, modifyFunction);
    this.selectableColors = selectableColors;
    this.selectableWeights = selectableWeights;
    this.selectedColorIndex = 0;
    this.selectedWeightIndex = 0;
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
      let cx = (currentPath[i - 1].x + p.x) / 2;
      let cy = (currentPath[i - 1].y + p.y) / 2;
      sketch.bezierVertex(cx, cy, cx, cy, p.x, p.y);
    }
  }
  sketch.endShape();
  currentPath = [];
}

const modeErase = new EraserTool("Erase", "eraser", (sketch) => {
  if (currentPath.length > 0) {
    sketch.erase();
    sketch.strokeWeight(modeErase.selectedWeight); // Set desired eraser size
    // Apply eraser to each point in the current path
    for (let p of currentPath) {
      sketch.point(p.x, p.y);
    }
  }
  currentPath = [];
}, [5, 10, 20, 30]);

const modeDraw = new DrawTool("Draw", "pencil", drawStroke, [colorBlack, colorBlue, colorGreen, colorRed], [1, 2, 5]);
const modeHighlight = new DrawTool("Highlight", "highlighter", drawStroke, [hColorYellow, hColorGreen, hColorPurple], [10, 20, 50]);

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

const initP5 = function () {
  if (myP5 !== null) {
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
    };
    sketch.draw = () => {
      if (isDrawing) {
        settings.value.selectedTool.modifyFunction(sketch, settings.value.selectedTool);
      }
    };

    canvas.addEventListener("pointermove", pointerMoveEvent);
  }, canvas);

  canvas.addEventListener("pointerdown", pointerDownEvent);
  window.addEventListener("pointerup", pointerUpEvent);
  canvas.addEventListener("pointerleave", pointerUpEvent);

  canvas.addEventListener('touchstart', killDefaultBehavior);
  canvas.addEventListener('touchmove', killDefaultBehavior);
  canvas.addEventListener('touchend', killDefaultBehavior);

  console.log('p5 initialized');
}

const pointerMoveEvent = event => {
  if (isDrawing && pointerType !== "touch") {
    const mX = myP5.mouseX;
    const mY = myP5.mouseY;
    const speed = myP5.dist(mX, mY, lastPoint.x, lastPoint.y);
    currentPath.push({
      x: mX,
      y: mY,
      speed: speed,
    });
    lastPoint.set(mX, mY);
    event.preventDefault();
  }
}

const pointerDownEvent = event => {
  isDrawing = true;
  pointerType = event.pointerType;
  currentPath = [];
  event.preventDefault();
}

const pointerUpEvent = event => {
  currentPath = [];
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
