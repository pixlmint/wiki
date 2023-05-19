<template>
    <div class="modals">
        <Login></Login>
        <CreateAdmin></CreateAdmin>
        <UserSettings></UserSettings>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Login from "@/src/components/auth/Login.vue";
import CreateAdmin from "@/src/components/auth/CreateAdmin.vue";
import UserSettings from "@/src/components/user-settings.vue";

export default defineComponent({
    name: 'Modals',
    components: {
        Login,
        CreateAdmin,
        UserSettings,
    },
})
</script>