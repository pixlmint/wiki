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
                <div @click="loadPage">
                    {{ element.title }}
                </div>
                <el-dropdown>
                    <el-button circle><el-icon><MoreFilled/></el-icon></el-button>
                </el-dropdown>
            </el-menu-item>
        </template>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {MoreFilled} from "@element-plus/icons-vue";
import {useWikiStore} from "@/src/stores/wiki";
import {useMainStore} from "@/src/stores/main";

export default defineComponent({
    name: 'PWNavElement',
    props: ['element', 'index', 'parentIndex'],
    components: {
      MoreFilled,
    },
    computed: {
        MoreFilled() {
            return MoreFilled
        },
        hasChildren() {
            return 'children' in this.element && this.element.children.length > 0;
        },
        childIndex() {
            return this.parentIndex + '-' + this.index;
        }
    },
    methods: {
        loadPage() {
            console.log(document.location.pathname);
            const entry = document.location.pathname;
            useWikiStore().fetchEntry(entry).then(function () {
                const currentEntry = useWikiStore().currentEntry;
                if (currentEntry === null) {
                    throw 'currentEntry is null';
                }
                useMainStore().setTitle(currentEntry.meta.title);
            });
        },
    }
});
</script>