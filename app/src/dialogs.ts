import LoginModal, {route as loginRoute} from "@/components/auth/Login.vue";
import CreateAdmin, {route as createAdminRoute} from "@/components/auth/CreateAdmin.vue";
import UserSettings, {route as settingsRoute} from "@/components/global-modals/user-settings.vue";
import ChangePassword, {route as changePasswordRoute} from "@/components/auth/ChangePassword.vue";
import RequestNewPassword, {route as requestNewPasswordRoute} from "@/components/auth/RequestNewPassword.vue";
import RestorePassword, {route as restorePasswordRoute} from "@/components/auth/RestorePassword.vue";
import NewPdf, {route as newPdfRoute} from "@/components/global-modals/new-pdf.vue";
import BoardSettings, {route as boardSettingsRoute} from "@/components/kanban/board-settings.vue";
import CardModal, {route as cardModalRoute} from "@/components/kanban/card-modal.vue";
import TableEditorModal, {route as tableEditorRoute} from "@/components/admin/Editor/tables/TableEditorModal.vue";
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
        component: NewPdf,
    },
    {
        route: boardSettingsRoute,
        component: BoardSettings,
    },
    {
        route: cardModalRoute,
        component: CardModal,
    },
    {
        route: tableEditorRoute,
        component: TableEditorModal,
    },
]);
