<template>
    <div class="modals">
        <Login></Login>
        <CreateAdmin></CreateAdmin>
        <UserSettings></UserSettings>
        <NewPDF></NewPDF>
        <DrawModal></DrawModal>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Login from "@/src/components/auth/Login.vue";
import CreateAdmin from "@/src/components/auth/CreateAdmin.vue";
import UserSettings from "@/src/components/user-settings.vue";
import NewPDF from "@/src/components/auth/NewPDF.vue";
import DrawModal from "@/src/components/admin/Editor/DrawModal.vue";

export default defineComponent({
    name: 'Modals',
    components: {
        Login,
        CreateAdmin,
        UserSettings,
        NewPDF,
        DrawModal,
    },
})
</script>