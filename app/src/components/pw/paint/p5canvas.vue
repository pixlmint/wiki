<template>
  <div class="canvas" ref="canvasContainer"></div>
</template>

<script setup>
import {ref, onMounted, defineProps} from 'vue';
import p5 from 'p5';


const props = defineProps({
  height: String,
  width: String,
});

const canvasContainer = ref(null);

let myP5 = null;
let isDrawing = false;
let pointerType = "";

let lastPoint;
let currentPath = [];

onMounted(() => {
  initP5();
  document.body.classList.add('selectDisabled');
})

const initP5 = function () {
  if (myP5 !== null) {
    console.log('p5 has already been initialized');
    return;
  }
  const canvas = canvasContainer.value;
  myP5 = new p5((sketch) => {
    sketch.setup = () => {
      sketch.createCanvas(props.width, props.height);
      sketch.background(255);
      sketch.frameRate(120);
      lastPoint = sketch.createVector(sketch.mouseX, sketch.mouseY);
    };
    sketch.draw = () => {
      sketch.beginShape();
      sketch.noFill();
      for (let i = 0; i < currentPath.length; i++) {
        const p = currentPath[i]
        sketch.strokeWeight(p.weight);
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
    };

    canvas.addEventListener("pointermove", (event) => {
      if (isDrawing && pointerType !== "touch") {
        const mX = sketch.mouseX;
        const mY = sketch.mouseY;
        const speed = sketch.dist(mX, mY, lastPoint.x, lastPoint.y);
        let weight = sketch.map(speed, 0, 10, 10, 1);
        weight = sketch.constrain(weight, 1, 2);
        currentPath.push({
          x: mX,
          y: mY,
          weight: weight,
        });
        lastPoint.set(mX, mY);
        event.preventDefault();
      }
    });
  }, canvas);

  canvas.addEventListener("pointerdown", event => {
    isDrawing = true;
    pointerType = event.pointerType;
    event.preventDefault();
  });

  window.addEventListener("pointerup", event => {
    currentPath = [];
    isDrawing = false;
    console.log('stopped drawing');
  });

  canvas.addEventListener("pointerleave", () => {
    currentPath = [];
    isDrawing = false;
  });

  canvas.addEventListener('touchstart', killDefaultBehavior);
  canvas.addEventListener('touchmove', killDefaultBehavior);
  canvas.addEventListener('touchend', killDefaultBehavior);

  function killDefaultBehavior(event) {
    event.preventDefault();
  }
  console.log('p5 initialized');
}
</script>


<style scoped lang="scss">
.canvas {
  touch-action: none;
  user-select: none;
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
