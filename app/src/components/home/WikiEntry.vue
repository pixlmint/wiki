<template>
    <div class="article">
        <div class="article-head">
            <div class="d-flex" style="align-items: center; gap: 1rem;">
                <div>
                    <el-breadcrumb separator="/" class="breadcrumbs print-visible">
                        <el-breadcrumb-item v-for="item in currentTitleArray">{{ item }}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <h1>{{ title }}</h1>
                </div>
                <el-tag type="info" v-if="isPdfContent">
                    PDF
                </el-tag>
                <el-icon v-if="!isPublic" title="This Entry is Private, only you can see it">
                    <Lock/>
                </el-icon>
            </div>
            <div v-if="canEdit" class="print-invisible">
                <el-dropdown class="mobile-action-buttons">
                    <el-button circle>
                        <el-icon>
                            <more-filled/>
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="viewMarkdown" title="View">
                            <el-icon><View/></el-icon>
                            View
                        </el-dropdown-item>
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
                    <el-button circle @click="viewMarkdown">
                        <el-icon><View/></el-icon>
                    </el-button>
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
            <div v-if="isPdfContent">
                <PDFContent :b64pdf="content"></PDFContent>
            </div>
            <p v-else v-html="content"></p>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from '@/src/stores/wiki'
import {useAuthStore} from "@/src/stores/auth";
import fa from '@/src/components/fa.vue'
import {useRouter} from "vue-router";
import {MoreFilled, Edit, Delete, Lock, View} from "@element-plus/icons-vue";
import PDFContent from "@/src/components/home/PDFContent.vue";
import {queryFormatter} from "@/src/helpers/queryFormatter";

export default defineComponent({
    name: "WikiEntry",
    data: () => {
        return {
            wikiStore: useWikiStore(),
            router: useRouter(),
            authStore: useAuthStore(),
        }
    },
    components: {
        PDFContent,
        fa,
        MoreFilled,
        Edit,
        Delete,
        Lock,
        View,
    },
    computed: {
        title() {
            return this.wikiStore.safeCurrentEntry.meta.title;
        },
        currentTitleArray() {
            const id = this.wikiStore.safeCurrentEntry.id;
            if (!id) {
                return [];
            }
            return id.split('/');
        },
        content() {
            window.setTimeout(() => {
                MathJax.typeset();
            }, 50);
            return this.wikiStore.safeCurrentEntry.content;
        },
        canEdit() {
            return useAuthStore().haveEditRights();
        },
        isPublic() {
            return this.wikiStore.safeCurrentEntry.meta.security !== 'private';
        },
        isPdfContent() {
            if (!('renderer' in this.wikiStore.safeCurrentEntry.meta)) {
                return false;
            }
            return 'pdf' === this.wikiStore.safeCurrentEntry.meta.renderer;
        },
    },
    methods: {
        editEntry() {
            this.router.push('/admin/edit?p=' + this.wikiStore.safeCurrentEntry.id);
        },
        deleteEntry() {
            const doDelete = confirm(`Are you sure you want to delete ${this.wikiStore.safeCurrentEntry.meta.title}`);
            if (doDelete) {
                useWikiStore().deleteEntry(this.wikiStore.safeCurrentEntry.id).then(() => {
                    useWikiStore().loadNav();
                    useWikiStore().fetchEntry('/');
                    this.router.push('/');
                });
            }
        },
        viewMarkdown() {
            const query = queryFormatter({token: this.authStore.token, entry: this.wikiStore.safeCurrentEntry.id});
            window.open(location.origin + "/api/admin/entry/view-markdown?" + query, "_blank");
        }
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

h1 {
    margin-top: 0.5rem;
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