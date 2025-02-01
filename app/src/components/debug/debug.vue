<template>
    <div>
        <div class="debug-open" v-show="!isShowing">
            <el-button @click="openDebug"><pm-icon icon="bug"></pm-icon></el-button>
        </div>
        <div class="debug" v-show="isShowing">
            <el-row justify="space-between">
                <el-col :span="6"><h2>Debug</h2></el-col>
                <el-col :span="3">
                    <el-button @click="closeDebug">
                        <pm-icon icon="times"></pm-icon>
                    </el-button>
                </el-col>
            </el-row>
            <div class="debug-view" v-for="(view, index) in views" :key="index">
                <h3>{{ view.title }}</h3>
                <component :is="view.component"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, shallowRef} from "vue";
import DialogsMonitor from "@/components/debug/dialogs-monitor.vue";

export default defineComponent({
    name: 'Debug',
    data() {
        return {
            views: [
                {
                    title: 'Dialogs',
                    component: shallowRef(DialogsMonitor),
                },
            ],
            isShowing: false,
        }
    },
    methods: {
        closeDebug() {
            this.isShowing = false;
        },
        openDebug() {
            this.isShowing = true;
        }
    },
});
</script>

<style scoped lang="scss">
.debug {
    z-index: 10000;
    position: absolute;
    width: 400px;
    height: 500px;
    background-color: rgba(223, 223, 223, 0.33);
    right: 0;
}

.debug-view {
    margin: 5px;
}
</style>
