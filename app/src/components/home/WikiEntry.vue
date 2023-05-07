<template>
    <div class="article">
        <div class="article-head">
            <h1>{{ title }}</h1>
            <div v-if="canEdit">
                <el-dropdown>
                    <el-button circle>
                        <el-icon>
                            <more-filled/>
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="editEntry" title="Edit"><el-icon><edit/></el-icon>Edit</el-dropdown-item>
                        <el-dropdown-item @click="deleteEntry" title="Delete"><el-icon><delete/></el-icon>Delete</el-dropdown-item>
                    </template>
                </el-dropdown>
            </div>
        </div>
        <div class="article-body">
            <p v-html="content"></p>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useMainStore} from "@/src/stores/main";
import fa from '@/src/components/fa.vue'
import {useRoute, useRouter} from "vue-router";
import {MoreFilled, Edit, Delete} from "@element-plus/icons-vue";

export default defineComponent({
    name: "WikiEntry",
    data: () => {
        return {
            entry: useRoute().path,
            wikiStore: useWikiStore(),
            router: useRouter(),
        }
    },
    components: {
        fa,
        MoreFilled,
        Edit,
        Delete,
    },
    created: function () {
        this.wikiStore.fetchEntry(this.entry).then(function () {
            useMainStore().setTitle(useWikiStore().currentEntry.meta.title);
        });
    },
    computed: {
        title() {
            return this.wikiStore.currentEntry?.meta.title;
        },
        content() {
            return this.wikiStore.currentEntry?.content;
        },
        canEdit() {
            return true;
            // return useAuthStore().token !== null;
        },
    },
    methods: {
        editEntry() {
            this.router.push('/admin/edit?p=' + this.entry);
        },
        deleteEntry() {
            const doDelete = confirm("Are you sure you want to delete this entry");
            if (doDelete) {
                // useWikiStore().deleteEntry(this.entry.id, useAuthStore().token);
            }
        },
    },
})
</script>