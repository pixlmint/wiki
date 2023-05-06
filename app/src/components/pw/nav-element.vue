<template>
    <div>
        <template v-if="hasChildren">
            <el-sub-menu :index="index">
                <template #title>
                    {{ element.title }}
                </template>
                <PWNavElement v-for="(childElement, myIndex) in element.children"
                              :parentIndex="index"
                              :key="myIndex"
                              :element="childElement"
                              :index="childIndex">
                </PWNavElement>
            </el-sub-menu>
        </template>
        <template v-else>
            <el-menu-item :index="element.id">
                {{ element.title }}
            </el-menu-item>
        </template>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'PWNavElement',
  props: ['element', 'index', 'parentIndex'],
  computed: {
    hasChildren() {
      return 'children' in this.element && this.element.children.length > 0;
    },
    childIndex() {
      return this.parentIndex + '-' + this.index;
    }
  }
});
</script>