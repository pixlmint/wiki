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
            </div>
            <div class="user-nav">
                <template v-if="!isLoggedIn">
                    <el-button @click="login">Login</el-button>
                </template>
                <template v-else>
                    <div @click="triggerUserDropdown" class="user-button">
                        <el-icon class="icon">
                            <Avatar></Avatar>
                        </el-icon>
                        <span class="text">Admin</span>
                    </div>
                </template>
            </div>
        </div>
        <div class="nav-user-dropdown" v-show="userDropdownShowing">
            <div v-for="action in userActions" @click="action.action" class="nav-user-dropdown-button">{{
                action.title
                }}
            </div>
            <div @click="switchTheme" class="nav-user-dropdown-button">
                <el-icon v-if="isLightTheme"><Sunny/></el-icon>
                <el-icon v-else><Moon/></el-icon>
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
import {Avatar, CaretRight, CaretLeft, Sunny, Moon} from "@element-plus/icons-vue";
import {isMobile} from "@/src/helpers/mobile-detector";

const findListElement = (target) => {
    if (target.nodeName === 'LI') {
        return target;
    }
    if (target.parentElement.nodeName === 'LI') {
        return target.parentElement;
    }
}

const navElementIsFolder = (target) => {
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
        PWNavElement,
        Avatar,
        CaretRight,
        CaretLeft,
        Sunny,
        Moon,
    },
    data() {
        return {
            router: useRouter(),
            dialogStore: useDialogStore(),
            userDropdownShowing: false,
            wikiStore: useWikiStore(),
            mainStore: useMainStore(),
            currentlyActiveRoute: '/',
            userActions: [
                {
                    title: "Logout",
                    action: this.logout,
                },
            ]
        }
    },
    created: () => {
        if (isMobile()) {
            useMainStore().toggleLargeNavShowing(false);
        }
        useWikiStore().loadNav();
    },
    methods: {
        switchTheme() {
            const currentTheme = this.mainStore.getTheme;
            if (currentTheme === 'light') {
                this.mainStore.setTheme('dark');
            } else {
                this.mainStore.setTheme('light');
            }
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
        triggerUserDropdown() {
            this.userDropdownShowing = !this.userDropdownShowing;
        },
        logout() {
            useAuthStore().logout();
            this.triggerUserDropdown();
        },
        login() {
            this.dialogStore.showDialog('/auth/login');
        },
    },
    computed: {
        isLightTheme() {
            return this.mainStore.getTheme === 'light';
        },
        currentTitleArray() {
            const id = this.wikiStore.currentEntry?.id;
            if (!id) {
                return [];
            }
            return id.split('/');
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
    width: $navWidth;
}

@media screen and (max-width: $mobileBreakpoint) {
    #nav {
        width: 100%;
    }
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
        padding-top: 20px;
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
        // background-color: white;
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