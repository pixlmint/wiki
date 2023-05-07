<template>
    <div>
        <template v-if="hasChildren">
            <el-sub-menu :index="index">
                <template #title>
                    {{ element.title }}
                    <el-dropdown>
                        <el-button circle>
                            <el-icon>
                                <more-filled/>
                            </el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-item @click="addPage">Add Page</el-dropdown-item>
                            <el-dropdown-item @click="addSubfolder">Add Subfolder</el-dropdown-item>
                            <el-dropdown-item @click="deleteFolder">Delete</el-dropdown-item>
                        </template>
                    </el-dropdown>
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
            <el-menu-item class="pw-menu-item" :index="element.id">
                <div>
                    {{ element.title }}
                </div>
                <el-dropdown>
                    <el-button circle>
                        <el-icon>
                            <more-filled/>
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="edit">Edit</el-dropdown-item>
                        <el-dropdown-item @click="rename">Rename</el-dropdown-item>
                        <el-dropdown-item @click="deletePage">Delete</el-dropdown-item>
                    </template>
                </el-dropdown>
            </el-menu-item>
        </template>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {MoreFilled} from "@element-plus/icons-vue";
import {useWikiStore} from "@/src/stores/wiki";
import {ElMessageBox} from "element-plus";
import {useAuthStore} from "@/src/stores/auth";

export default defineComponent({
    name: 'PWNavElement',
    props: ['element', 'index', 'parentIndex'],
    data() {
        return {
            wikiStore: useWikiStore(),
            token: useAuthStore().getToken,
        }
    },
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
        edit() {
            console.log(this.element);
        },
        rename() {
            ElMessageBox.prompt('Pick a new Name', 'Rename', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
                inputValue: this.element.title,
            }).then(name => {
                this.wikiStore.renameEntry(name.value, this.token);
            })
        },
        deletePage() {
            console.log(this.element);
            ElMessageBox.confirm('Are you sure you want to delete this page?', 'Warning', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning',
            }).then(() => {
                this.wikiStore.deleteEntry(this.element.id, this.token);
            });
        },
        deleteFolder() {
            ElMessageBox.confirm('Are you sure you want to delete this folder and everything within it?', 'Warning', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning',
            }).then(() => {
                console.log('todo: delete folder');
            });
        },
        addPage() {
            ElMessageBox.prompt('New Page Title', 'Add Page', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
            }).then(name => {
                this.wikiStore.addEntry(this.element.id, this.token);
            })
        },
        addSubfolder() {
            ElMessageBox.prompt('New Subfolder', 'Add Subfolder', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
            }).then(name => {
                this.wikiStore.addFolder(this.element.id, this.token);
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

</style>