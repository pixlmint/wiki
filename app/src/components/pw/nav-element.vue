<template>
    <div>
        <template v-if="isFolder">
            <el-sub-menu data-is-entry="false" :index="element.id">
                <template #title>
                    <span class="submenu-title">{{ element.title }}</span>
                    <pm-icon icon="lock" class="private-icon" v-if="!isPublic"></pm-icon>
                    <el-dropdown v-if="canEdit">
                        <el-button circle>
                            <pm-icon icon="ellipsis"></pm-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-item @click="addPage"><pm-icon icon="file-circle-plus"></pm-icon>Add Page</el-dropdown-item>
                            <el-dropdown-item @click="addPdf"><pm-icon icon="file-circle-plus"></pm-icon>Add PDF</el-dropdown-item>
                            <el-dropdown-item @click="addSubfolder"><pm-icon icon="folder-plus"></pm-icon>Add Subfolder</el-dropdown-item>
                            <el-dropdown-item @click="addBoard"><pm-icon package="brands" icon="trello"></pm-icon>Add Board</el-dropdown-item>
                            <el-dropdown-item @click="switchSecurity">
                                <pm-icon v-if="isPublic" icon="lock"></pm-icon>
                                <pm-icon v-else icon="unlock"></pm-icon>
                                {{ securitySwitchText }}
                            </el-dropdown-item>
                            <el-dropdown-item class="danger" @click="deleteFolder"><pm-icon icon="trash"></pm-icon>Delete</el-dropdown-item>
                        </template>
                    </el-dropdown>
                </template>
                <PWNavElement v-for="(childElement, myIndex) in element.children"
                              :key="myIndex"
                              :element="childElement">
                </PWNavElement>
            </el-sub-menu>
        </template>
        <template v-else>
            <el-menu-item :data-pw-entry-id="element.id" class="pw-menu-item" data-is-entry="true" :index="element.id">
                <div class="d-flex align-items-center gap-2">
                    {{ element.title }}
                    <el-tag type="info" v-if="element.kind === 'board'"><pm-icon icon="trello" package="brands"></pm-icon></el-tag>
                    <el-tag type="danger" v-if="element.kind === 'pdf'"><pm-icon icon="file-pdf"></pm-icon></el-tag>
                    <pm-icon icon="lock" class="private-icon" v-if="!isPublic"></pm-icon>
                </div>
                <el-dropdown v-if="canEdit">
                    <el-button circle>
                        <pm-icon icon="ellipsis"></pm-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="edit"><pm-icon icon="pen"></pm-icon>Edit</el-dropdown-item>
                        <el-dropdown-item @click="rename"><pm-icon icon="pen-to-square"></pm-icon>Rename</el-dropdown-item>
                        <el-dropdown-item @click="switchSecurity">
                            <pm-icon v-if="isPublic" icon="lock"></pm-icon>
                            <pm-icon v-else icon="unlock"></pm-icon>
                            {{ securitySwitchText }}
                        </el-dropdown-item>
                        <el-dropdown-item class="danger" @click="deletePage"><pm-icon icon="trash"></pm-icon>Delete</el-dropdown-item>
                    </template>
                </el-dropdown>
            </el-menu-item>
        </template>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from "@/src/stores/wiki";
import {ElMessageBox} from "element-plus";
import {useAuthStore, useDialogStore} from "pixlcms-wrapper";
import {useMainStore} from "@/src/stores/main";
import {useBoardStore} from "@/src/stores/board";
import {navigate} from "@/src/helpers/navigator";

export default defineComponent({
    name: 'PWNavElement',
    props: ['element', 'index', 'parentIndex'],
    data() {
        return {
            wikiStore: useWikiStore(),
            token: useAuthStore().getToken,
            dialogStore: useDialogStore(),
            boardStore: useBoardStore(),
        }
    },
    computed: {
        isFolder() {
            return this.element && this.element.isFolder && this.element.kind === 'plain';
        },
        canEdit() {
            return useAuthStore().haveEditRights();
        },
        isPublic() {
            return this.element && this.element.isPublic;
        },
        securitySwitchText() {
          if (this.isPublic) {
              return 'Set Private';
          } else {
              return 'Set Public';
          }
        },
    },
    methods: {
        edit() {
            const currentRoute = location.pathname;
            navigate('/admin/edit?p=' + this.element.id);
            if (currentRoute === '/admin/edit') {
                useWikiStore().fetchEntry(this.element.id).then(() => {
                    const title = "Edit " + useWikiStore().safeCurrentEntry.meta.title;
                    useMainStore().setTitle(title)
                });
            }
        },
        rename() {
            ElMessageBox.prompt('Pick a new Name', 'Rename', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
                inputValue: this.element.title,
            }).then(name => {
                this.wikiStore.renameEntry(name.value).then(response => {
                    this.wikiStore.loadNav();
                });
            })
        },
        deletePage() {
            console.log(this.element);
            ElMessageBox.confirm('Are you sure you want to delete this page?', 'Warning', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning',
            }).then(() => {
                this.wikiStore.deleteEntry(this.element.id).then(() => {
                    this.wikiStore.loadNav();
                });
            });
        },
        switchSecurity() {
            const newState = this.isPublic ? 'private' : 'public';
            this.element.isPublic = !this.element.isPublic;
            this.wikiStore.setSecurityState(this.element.id, newState).then(() => {
                this.wikiStore.loadNav();
            });
        },
        deleteFolder() {
            ElMessageBox.confirm('Are you sure you want to delete this folder and everything within it?', 'Warning', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning',
            }).then(() => {
                this.wikiStore.deleteFolder(this.element.id, this.token).then(() => {
                    this.wikiStore.loadNav();
                });
            });
        },
        addPage() {
            ElMessageBox.prompt('New Page Title', 'Add Page', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
            }).then(name => {
                this.wikiStore.addEntry(this.element.id, name.value).then(response => {
                    this.wikiStore.loadNav();
                });
            })
        },
        addBoard() {
            ElMessageBox.prompt('New Board', 'Add Board', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
            }).then(name => {
                this.boardStore.createBoard(this.element.id, name.value).then(() => {
                    this.wikiStore.loadNav();
                })
            });
        },
        addPdf() {
            this.dialogStore.showDialog({route: '/nav/new-pdf', data: this.element.id});
        },
        addSubfolder() {
            ElMessageBox.prompt('New Subfolder', 'Add Subfolder', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
            }).then(name => {
                this.wikiStore.addFolder(this.element.id, name.value).then(() => {
                    this.wikiStore.loadNav();
                })
            })
        },
    }
});
</script>

<style scoped lang="scss">
.el-dropdown {
    button {
        margin-left: 1rem;
    }
}

.el-dropdown-menu__item {
    svg {
        margin-right: 5px;
    }
}

.el-sub-menu__title {
    .submenu-title {
        margin-right: 5px;
    }
}

.private-icon {
    color: var(--el-text-color-secondary);
}
</style>
