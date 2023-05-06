<template>
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
                <el-dropdown>
                   <span class="el-dropdown-link">
                       <el-icon>
                           <Avatar></Avatar>
                       </el-icon>
                       Admin
                   </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>
                                Action 1
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </template>
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
        }
    },
    created: () => {
        const wikiStore = useWikiStore();
        wikiStore.loadNav();
    },
    methods: {
        login() {
            this.dialogStore.showDialog('/auth/login');
        },
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
            console.log(toRaw(wikiStore.getNav));
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
}

.el-dropdown-link {
    width: 100%;
    height: 3rem;

    &:hover {
        background-color: #e8e8e8;
    }
}
</style>