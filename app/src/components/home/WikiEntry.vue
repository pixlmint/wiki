<template>
    <div class="article">
        <div class="article-head">
            <h1>{{ title }}</h1>
            <div v-if="canEdit">
                <el-dropdown class="mobile-action-buttons">
                    <el-button circle>
                        <el-icon>
                            <more-filled/>
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="editEntry" title="Edit">
                            <el-icon>
                                <edit/>
                            </el-icon>
                            Edit
                        </el-dropdown-item>
                        <el-dropdown-item class="danger" @click="deleteEntry" title="Delete">
                            <el-icon>
                                <delete/>
                            </el-icon>
                            Delete
                        </el-dropdown-item>
                    </template>
                </el-dropdown>
                <div class="desktop-action-buttons">
                    <el-button @click="editEntry">
                        <el-icon>
                            <edit/>
                        </el-icon>
                        Edit
                    </el-button>
                    <el-button type="danger" @click="deleteEntry" circle>
                        <el-icon>
                            <delete/>
                        </el-icon>
                    </el-button>
                </div>
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
import {useAuthStore} from "@/src/stores/auth";
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
            return useAuthStore().haveEditRights();
        },
    },
    methods: {
        editEntry() {
            this.router.push('/admin/edit?p=' + this.entry);
        },
        deleteEntry() {
            const doDelete = confirm("Are you sure you want to delete this entry");
            if (doDelete) {
                useWikiStore().deleteEntry(this.entry, useAuthStore().token);
                // TODO: what now?
            }
        },
    },
})
</script>

<style lang="scss">
@import '../../../style/variables.scss';

.article-body {
  margin: 5px;

  img {
    max-width: unset;
    width: 100vw;
    margin-left: -5px;
  }
}

h2, h3, h4, h5, h6 {
  border-bottom: 1px solid var(--el-border-color);
}

.mobile-action-buttons {
    display: block !important;
}

.desktop-action-buttons {
    display: none;
}

@media screen and (min-width: $mobileBreakpoint) {
    .mobile-action-buttons {
        display: none !important;
    }

    .desktop-action-buttons {
        display: block;
    }
}
</style>