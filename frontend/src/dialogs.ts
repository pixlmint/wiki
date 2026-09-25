import LoginModal from "@/components/auth/Login.vue";
import CreateAdmin from "@/components/auth/CreateAdmin.vue";
import ChangePassword from "@/components/auth/ChangePassword.vue";
import RequestNewPassword from "@/components/auth/RequestNewPassword.vue";
import RestorePassword from "@/components/auth/RestorePassword.vue";
import MediaModal, {
    route as mediaRoute,
} from "@/components/admin/Editor/media/MediaModal.vue";
import { defineDialogs } from "pixlcms-wrapper";
import { defineAsyncComponent } from "vue";
import NewPdf from "./components/global-modals/new-pdf.vue";
import Settings from "./components/global-modals/user-settings.vue";

export const loginRoute = "/auth/login";
export const createAdminRoute = "/auth/create-admin";
export const settingsRoute = "/settings";
export const changePasswordRoute = "/auth/change-password";
export const requestNewPasswordRoute = "/auth/request-new-password";
export const restorePasswordRoute = "/auth/restore-password";
export const newPdfRoute = "/nav/new-alternative-content";
export const tableEditorRoute = "/table-editor";
export const jupyterSetupRoute = "/jupyter/modal";

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
        component: Settings,
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
        route: tableEditorRoute,
        component: defineAsyncComponent(
            () =>
                import("@/components/admin/Editor/tables/TableEditorModal.vue"),
        ),
    },
    {
        route: mediaRoute,
        component: MediaModal,
    },
    {
        route: jupyterSetupRoute,
        component: defineAsyncComponent(
            () => import("@/components/jupyter/jupyter-setup-modal.vue"),
        ),
    },
]);
