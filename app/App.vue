<template>
    <div class="wiki">
        <pw-loading></pw-loading>
        <pw-nav></pw-nav>
        <div :class="mainContentClasses">
            <router-view></router-view>
        </div>
        <Modals/>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useMainStore} from "@/src/stores/main";
import {useAuthStore} from "@/src/stores/auth";
import {useWikiStore} from "@/src/stores/wiki";
import {AxiosResponse} from "axios";
import {ElNotification} from "element-plus";
import Modals from "@/src/components/modals.vue";
import {useDialogStore} from "@/src/stores/dialog";

export default defineComponent({
    name: "App",
    components: {
        Modals,
    },
    data: () => {
        return {
            mainStore: useMainStore(),
            wikiStore: useWikiStore(),
            dialogStore: useDialogStore(),
        }
    },
    computed: {
      mainContentClasses() {
          if (this.mainStore.isLargeNavShowing) {
              return 'main-content large-nav';
          } else {
              return 'main-content small-nav';
          }
      }
    },
    created() {
        this.mainStore.loadTheme();
        const mainStore = useMainStore();
        const authStore = useAuthStore();
        authStore.loadToken();
        const entry = document.location.pathname;
        const token = authStore.getToken;
        mainStore.init(token).then((response: AxiosResponse) => {
            if (response.data.is_token_valid === 'token_invalid') {
                this.dialogStore.showDialog('/auth/login');
                ElNotification({
                    title: 'Error',
                    message: 'Your token is invalid, please login again',
                    type: 'warning',
                });
            }
            this.mainStore.setTitle(this.mainStore.getMeta.title);
            if (!this.mainStore.meta.adminCreated) {
                this.dialogStore.showDialog('/auth/create-admin');
            }
        })
    },
})
</script>

<style lang="scss">
@import './style/main.scss';
.main-content {
    background-color: var(--el-bg-color);
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    min-width: 100%;
    min-height: 100vh;
    padding: 5px;

    &.small-nav {
        margin: 0 auto 0 1rem;
    }
}

@media screen and (min-width: $mobileBreakpoint) {
    .main-content {
        &.large-nav {
            margin: 0 0 0 $navWidth;
        }

        .article-body {
            padding: 0;

            img {
                max-width: 1000px;
            }
        }
    }
}

@media screen and (min-width: 1500px) {
    .main-content {
        &.large-nav {
            margin: 0 auto 0 auto !important;
        }
    }
}

@media screen and (min-width: 1300px) {
    .main-content {
        width: 80%;
        min-width: unset !important;
        max-width: 1000px;
        box-shadow: var(--box-shadow);

        &.large-nav {
            margin: 0 auto 0 $navWidth;
        }

        &.small-nav {
            margin: 0 auto 0 auto;
        }
    }
}
</style>