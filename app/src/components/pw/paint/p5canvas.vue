<template>
  <div ref="canvasContainer"></div>
</template>

<script>
import {defineComponent, onMounted, ref} from 'vue';
import p5 from 'p5';

export default defineComponent({
  name: 'P5Canvas',
  data() {
    return  {
      canvasContainer: ref('canvasContainer'),
      myP5: null,
    }
  },
  mounted() {
    this.myP5 = new p5((sketch) => {
      sketch.setup = () => {
        sketch.createCanvas(800, 600);
        sketch.background(255);
      };
      sketch.draw = () => {
        if (sketch.mouseIsPressed) {
          sketch.stroke(0);
          sketch.strokeWeight(4);
          sketch.line(sketch.mouseX, sketch.mouseY, sketch.pmouseX, sketch.pmouseY);
        }
      };
    }, this.canvasContainer.value);
  },
});
</script>

<style>
/* Add styles if needed */
</style>
