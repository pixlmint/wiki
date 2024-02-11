import LoginModal, {route as loginRoute} from "@/src/components/auth/Login.vue";
import CreateAdmin, {route as createAdminRoute} from "@/src/components/auth/CreateAdmin.vue";
import UserSettings, {route as settingsRoute} from "@/src/components/global-modals/user-settings.vue";
import ChangePassword, {route as changePasswordRoute} from "@/src/components/auth/ChangePassword.vue";
import RequestNewPassword, {route as requestNewPasswordRoute} from "@/src/components/auth/RequestNewPassword.vue";
import RestorePassword, {route as restorePasswordRoute} from "@/src/components/auth/RestorePassword.vue";
import NewPDF, {route as newPdfRoute} from "@/src/components/auth/NewPDF.vue";
import {defineDialogs} from "pixlcms-wrapper";

export const dialogs = defineDialogs([
    {
        route: loginRoute,
        component: LoginModal,
    },
    {
        route: createAdminRoute,
        component: CreateAdmin,
    },
    {
        route: settingsRoute,
        component: UserSettings,
    },
    {
        route: changePasswordRoute,
        component: ChangePassword,
    },
    {
        route: requestNewPasswordRoute,
        component: RequestNewPassword,
    },
    {
        route: restorePasswordRoute,
        component: RestorePassword,
    },
    {
        route: newPdfRoute,
        component: NewPDF,
    },
]);