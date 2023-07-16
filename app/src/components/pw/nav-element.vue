<template>
    <div>
        <template v-if="isFolder">
            <el-sub-menu data-is-entry="false" :index="element.id">
                <template #title>
                    {{ element.title }}
                    <el-icon class="private-icon" v-if="!isPublic"><Lock/></el-icon>
                    <el-dropdown v-if="canEdit">
                        <el-button circle>
                            <el-icon>
                                <more-filled/>
                            </el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-item @click="addPage"><el-icon><DocumentAdd/></el-icon>Add Page</el-dropdown-item>
                            <el-dropdown-item @click="addSubfolder"><el-icon><FolderAdd/></el-icon>Add Subfolder</el-dropdown-item>
                            <el-dropdown-item @click="switchSecurity">
                                <el-icon v-if="isPublic">
                                    <Lock/>
                                </el-icon>
                                <el-icon v-else>
                                    <Unlock/>
                                </el-icon>
                                {{ securitySwitchText }}
                            </el-dropdown-item>
                            <el-dropdown-item class="danger" @click="deleteFolder"><el-icon><Delete/></el-icon>Delete</el-dropdown-item>
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
            <el-menu-item class="pw-menu-item" data-is-entry="true" :index="element.id">
                <div>
                    {{ element.title }}
                    <el-icon class="private-icon" v-if="!isPublic"><Lock/></el-icon>
                </div>
                <el-dropdown v-if="canEdit">
                    <el-button circle>
                        <el-icon>
                            <more-filled/>
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="edit"><el-icon><Edit/></el-icon>Edit</el-dropdown-item>
                        <el-dropdown-item @click="rename"><el-icon><EditPen/></el-icon>Rename</el-dropdown-item>
                        <el-dropdown-item @click="switchSecurity">
                            <el-icon v-if="isPublic">
                                <Lock/>
                            </el-icon>
                            <el-icon v-else>
                                <Unlock/>
                            </el-icon>
                            {{ securitySwitchText }}
                        </el-dropdown-item>
                        <el-dropdown-item class="danger" @click="deletePage"><el-icon><Delete/></el-icon>Delete</el-dropdown-item>
                    </template>
                </el-dropdown>
            </el-menu-item>
        </template>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useRouter} from "vue-router";
import {MoreFilled, FolderAdd, DocumentAdd, Delete, Edit, EditPen, Lock, Unlock} from "@element-plus/icons-vue";
import {useWikiStore} from "@/src/stores/wiki";
import {ElMessageBox} from "element-plus";
import {useAuthStore} from "@/src/stores/auth";
import {useMainStore} from "@/src/stores/main";

export default defineComponent({
    name: 'PWNavElement',
    props: ['element', 'index', 'parentIndex'],
    data() {
        return {
            wikiStore: useWikiStore(),
            router: useRouter(),
            token: useAuthStore().getToken,
        }
    },
    components: {
        MoreFilled,
        FolderAdd,
        DocumentAdd,
        Delete,
        Edit,
        EditPen,
        Lock,
        Unlock,
    },
    computed: {
        MoreFilled() {
            return MoreFilled
        },
        isFolder() {
            return this.element && this.element.isFolder;
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
            this.router.push('/admin/edit?p=' + this.element.id);
            if (currentRoute === '/admin/edit') {
                useWikiStore().fetchEntry(this.element.id).then(() => {
                    this.title = "Edit " + useWikiStore().currentEntry?.meta.title;
                    useMainStore().setTitle(this.title)
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

.private-icon {
    color: var(--el-text-color-secondary);
}
</style>