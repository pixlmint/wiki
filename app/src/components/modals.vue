<template>
    <div class="modals">
        <Login></Login>
        <CreateAdmin></CreateAdmin>
        <UserSettings></UserSettings>
        <NewPDF></NewPDF>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Login from "@/src/components/auth/Login.vue";
import CreateAdmin from "@/src/components/auth/CreateAdmin.vue";
import UserSettings from "@/src/components/user-settings.vue";
import NewPDF from "@/src/components/auth/NewPDF.vue";

export default defineComponent({
    name: 'Modals',
    components: {
        Login,
        CreateAdmin,
        UserSettings,
        NewPDF,
    },
})
</script>