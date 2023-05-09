<template>
    <div>
        <div id="nav">
            <el-menu @click="loadPage" :router="true" class="main-nav">
                <PWNavElement v-for="(childElement, myIndex) in nav.children"
                              parentIndex="0"
                              :key="myIndex"
                              :element="childElement"
                              :index="myIndex">
                </PWNavElement>
            </el-menu>
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
import {Avatar} from "@element-plus/icons-vue";

export default defineComponent({
    name: 'PWNav',
    components: {
        PWNavElement,
        Avatar,
    },
    data() {
        return {
            router: useRouter(),
            dialogStore: useDialogStore(),
            userDropdownShowing: false,
            userActions: [
                {
                    title: "Logout",
                    action: this.logout,
                }
            ]
        }
    },
    created: () => {
        const wikiStore = useWikiStore();
        wikiStore.loadNav();
    },
    methods: {
        loadPage() {
            const entry = document.location.pathname;
            console.log(entry);
            if (entry === '/admin/edit') {
                return '';
            }
            useWikiStore().fetchEntry(entry).then(function () {
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
#nav {
    background-color: white;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    width: 250px;
}

.user-button {
    width: 100%;
    height: 3rem;
    border-radius: 5px;
    margin: 2px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 5px;

    &:hover {
        background-color: #f6f6f6;
    }
}

.nav-user-dropdown {
    position: fixed;
    bottom: 3rem;
    left: 3rem;
    background-color: white;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    min-width: 10%;
    border-radius: 10px;
    border: 1px solid #e9e9e9;

    .nav-user-dropdown-button {
        width: 100%;
        display: block;
        background-color: white;
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
            background-color: #f6f6f6;
        }
    }
}
</style>