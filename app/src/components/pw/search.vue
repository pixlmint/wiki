<template>
    <div class="search-wrapper">
        <div class="search">
            <el-input id="search-input" v-model="searchQuery" @input="search"/>
            <div @click="openEntry(item)" class="search-result" v-for="item in searchResults">
                {{ item }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {useWikiStore} from "@/src/stores/wiki";
import {useMainStore} from "@/src/stores/main";

export default defineComponent({
    name: 'PWSearch',
    data() {
        return {
            searchQuery: '',
            searchResults: [],
            timeoutTimer: 0,
        };
    },
    methods: {
        openEntry(id: string) {
            useWikiStore().fetchEntry(id);
            useMainStore().isSearchShowing = false;
            //this.router.push(id);
        },
        search() {
            window.clearTimeout(this.timeoutTimer);
            if (this.searchQuery.length < 3) {
                return;
            }
            window.setTimeout(this.doSearch, 250);
        },
        doSearch() {
            useWikiStore().search(this.searchQuery).then(response => {
                this.searchResults = response.data;
            });
        },
    }
})
</script>

<style scoped lang="scss">
@import "@/style/variables";

.search-wrapper {
    display: flex;
    align-items: center;
    position: absolute;
    width: calc(100vw - $navSmallWidth);

    .search {
        width: 100%;

        input {
            width: 100%;
            background-color: var(--el-bg-secondary);
        }
    }

    .search-result {
        padding: 1rem;
        cursor: pointer;
        background-color: var(--el-bg-secondary);
    }
}

@media screen and (min-width: 500px) {
    .search-wrapper {
        min-width: 50%;
        padding: 5%;
        border-radius: 50%;

        .search {
            box-shadow: 0 0 50px 25px rgba(130, 130, 130, 0.5);
            margin: 0 auto;
            max-width: 50%;
        }
    }
}
</style>