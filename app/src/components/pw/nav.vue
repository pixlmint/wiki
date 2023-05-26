<template>
    <div>
        <div id="nav" v-show="mainNavShowing">
            <div>
                <div @click="hideMainNav" class="nav-toggle">
                    <el-icon>
                        <CaretLeft/>
                    </el-icon>
                </div>
                <el-menu @click="loadPage" :router="true" class="main-nav">
                    <PWNavElement v-for="(childElement, myIndex) in nav.children"
                                  parentIndex="0"
                                  :key="myIndex"
                                  :element="childElement"
                                  :index="myIndex">
                    </PWNavElement>
                </el-menu>
                <el-dropdown class="full-width" v-if="canEdit">
                    <el-button class="full-width">
                        <el-icon>
                            <CirclePlus/>
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="addSubFolder">
                                <el-icon>
                                    <FolderAdd/>
                                </el-icon>
                                Folder
                            </el-dropdown-item>
                            <el-dropdown-item @click="addSubEntry">
                                <el-icon>
                                    <DocumentAdd/>
                                </el-icon>
                                Entry
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div class="user-nav">
                <template v-if="!isLoggedIn">
                    <el-button @click="login" class="user-button">Login</el-button>
                </template>
                <template v-else>
                    <el-dropdown>
                        <el-button class="user-button">
                            <el-icon class="icon">
                                <Avatar></Avatar>
                            </el-icon>
                            <span class="text">Admin</span>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-item v-for="action in userActions" @click="action.action">{{
                                action.title
                                }}
                            </el-dropdown-item>
                        </template>
                    </el-dropdown>
                </template>
            </div>
        </div>
        <div class="nav-user-dropdown" v-show="userDropdownShowing">
            <div v-for="action in userActions" @click="action.action" class="nav-user-dropdown-button">{{
                action.title
                }}
            </div>
        </div>
        <div id="mobile-nav" v-show="!mainNavShowing" @click="showMainNav">
            <el-icon class="nav-toggle-small">
                <CaretRight/>
            </el-icon>
            <el-breadcrumb separator="/" class="breadcrumbs">
                <el-breadcrumb-item v-for="item in currentTitleArray">{{ item }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from "@/src/stores/wiki";
import {toRaw} from "vue";
import PWNavElement from "@/src/components/pw/nav-element.vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "@/src/stores/auth";
import {useRouter} from "vue-router";
import {useDialogStore} from "@/src/stores/dialog";
import {
    Avatar,
    CaretRight,
    CaretLeft,
    CirclePlus,
    FolderAdd,
    DocumentAdd,
} from "@element-plus/icons-vue";
import {isMobile} from "@/src/helpers/mobile-detector";
import {ElMessageBox} from "element-plus";

const findListElement = (target: any) => {
    if (target.nodeName === 'LI') {
        return target;
    }
    if (target.parentElement.nodeName === 'LI') {
        return target.parentElement;
    }
}

const navElementIsFolder = (target: any) => {
    const listElement = findListElement(target);
    if (listElement.classList.contains('el-sub-menu')) {
        return true;
    }
    if (listElement.classList.contains('el-menu-item')) {
        return false;
    }
}

export default defineComponent({
    name: 'PWNav',
    components: {
        DocumentAdd,
        FolderAdd,
        PWNavElement,
        Avatar,
        CaretRight,
        CaretLeft,
        CirclePlus,
    },
    data() {
        return {
            router: useRouter(),
            dialogStore: useDialogStore(),
            userDropdownShowing: false,
            wikiStore: useWikiStore(),
            mainStore: useMainStore(),
            authStore: useAuthStore(),
            currentlyActiveRoute: '/',
            userActions: [
                {
                    title: "Logout",
                    action: this.logout,
                },
                {
                    title: "Settings",
                    action: this.settings,
                }
            ],
            token: useAuthStore().getToken,
        }
    },
    created: () => {
        if (isMobile()) {
            useMainStore().toggleLargeNavShowing(false);
        }
        useWikiStore().loadNav();
    },
    methods: {
        settings() {
            this.dialogStore.showDialog('/settings');
        },
        addSubFolder() {
            ElMessageBox.prompt('New Subfolder', 'Add Subfolder', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
            }).then(name => {
                this.wikiStore.addFolder('/', name.value, this.token).then(() => {
                    this.wikiStore.loadNav();
                });
            })
        },
        addSubEntry() {
            ElMessageBox.prompt('New Page Title', 'Add Page', {
                confirmButtonText: 'Ok',
                cancelButtonText: 'Cancel',
            }).then(name => {
                this.wikiStore.addEntry('/', name.value, this.token).then(response => {
                    this.wikiStore.loadNav();
                });
            })
        },
        hideMainNav() {
            this.mainStore.toggleLargeNavShowing(false);
        },
        showMainNav() {
            this.mainStore.toggleLargeNavShowing(true);
        },
        loadPage(event: any) {
            const isFolder = navElementIsFolder(event.target);
            const entry = document.location.pathname;
            console.log(entry);
            if (entry === '/admin/edit' || isFolder) {
                return '';
            }
            useWikiStore().fetchEntry(entry).then(function () {
                if (!isFolder && isMobile()) {
                    useMainStore().toggleLargeNavShowing(false);
                }
                const currentEntry = useWikiStore().currentEntry;
                if (currentEntry === null) {
                    throw 'currentEntry is null';
                }
                useMainStore().setTitle(currentEntry.meta.title);
            });
        },
        logout() {
            useAuthStore().logout();
        },
        login() {
            this.dialogStore.showDialog('/auth/login');
        },
    },
    computed: {
        currentTitleArray() {
            const id = this.wikiStore.currentEntry?.id;
            if (!id) {
                return [];
            }
            return id.split('/');
        },
        canEdit() {
            return this.authStore.haveEditRights();
        },
        mainNavShowing() {
            return this.mainStore.isLargeNavShowing;
        },
        isLoggedIn() {
            return useAuthStore().getToken !== null;
        },
        nav() {
            const wikiStore = useWikiStore()
            if (wikiStore.getNav === null) {
                return {}
            }
            return toRaw(wikiStore.getNav);
        },
    },
})
</script>

<style scoped lang="scss">
@import '@/style/variables.scss';

#nav {
    background-color: var(--el-bg-color);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    width: $navLargeWidth;
}

@media screen and (max-width: $mobileBreakpoint) {
    #nav {
        width: 100%;
    }
}

.user-nav .el-dropdown {
    width: 100%;
}

.user-button {
    width: 100%;
    height: 3rem;
    border-radius: 5px;
    margin: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    font-family: "JetBrains-Mono Regular", sans-serif;
    outline: none !important;
    border: none !important;
    font-size: 1.1rem;

    &:hover {
        background-color: var(--el-menu-hover-bg-color);
    }
}

#mobile-nav {
    display: block;
    position: fixed;
    left: 0;
    background-color: var(--el-bg-color);
    min-height: 100vh;
    bottom: 0;
    width: 1.5rem;
    cursor: pointer;

    .nav-toggle-small {
        position: absolute;
        top: 10px;
    }

    .breadcrumbs {
        transform: rotate(270deg) translate(-100%, 0);
        width: 100vh;
        transform-origin: top left;
    }
}

.nav-toggle {
    width: calc(100% - 40px);
    padding: 20px 20px 20px 20px;
    cursor: pointer;

    &:hover {
        background-color: var(--el-menu-hover-bg-color);
    }
}

.nav-user-dropdown {
    position: fixed;
    bottom: 3rem;
    left: 3rem;
    box-shadow: var(--box-shadow);
    min-width: 10%;
    border-radius: 10px;

    .nav-user-dropdown-button {
        width: 100%;
        display: block;
        outline: none;
        border: none;
        text-align: center;
        padding: 10px 0;
        cursor: pointer;
        border-radius: 5px;

        &:first-of-type {
            border-top-right-radius: 10px;
            border-top-left-radius: 10px;
        }

        &:last-of-type {
            border-bottom-right-radius: 10px;
            border-bottom-left-radius: 10px;
        }

        &:hover {
            background-color: var(--el-menu-hover-bg-color);
        }
    }
}
</style>

<style lang="scss">
button.is-circle, .el-button.is-circle {
    height: 2rem;
    width: 2rem;
}
</style>