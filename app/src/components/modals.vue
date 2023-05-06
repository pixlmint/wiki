<template>
    <div class="modals">
        <Login></Login>
        <CreateAdmin></CreateAdmin>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Login from "@/src/components/auth/Login.vue";
import CreateAdmin from "@/src/components/auth/CreateAdmin.vue";

export default defineComponent({
    name: 'Modals',
    components: {
        Login,
        CreateAdmin,
    },
})
</script>