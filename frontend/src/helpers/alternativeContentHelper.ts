import { type AxiosRequestConfig } from "axios";
import { buildRequest } from "pixlcms-wrapper";

export interface AlternativeContentFormData extends Record<string, string | File | undefined> {
    title: string,
    renderer: string,
}

type AlternativeContentFormArgs = {
    renderer: string;
    title?: string;
    mime?: string;
};

export class AlternativeContentForm {
    declare mime: string;
    declare formData: AlternativeContentFormData;

    constructor({ renderer, title = '', mime = "*/*" }: AlternativeContentFormArgs) {
        this.mime = mime;

        this.formData = {
            title: title,
            renderer: renderer,
        };
    }

    setValue(key: string, value: string | File) {
        this.formData[key] = value;
    }

    buildUploadForm(): AxiosRequestConfig {
        const formData = this._buildFormData();

        /** @ts-ignore */
        return buildRequest('/api/admin/entry/upload-alternative-content', formData, 'POST');
    }

    buildUpdateForm(): AxiosRequestConfig {
        const formData = this._buildFormData();

        /** @ts-ignore */
        return buildRequest('/api/admin/entry/update-alternative-content', formData, 'POST');
    }

    _buildFormData(): FormData {
        const formData = new FormData();

        const files: Record<string, File> = {};

        for (const [key, value] of Object.entries(this.formData)) {
            if (typeof value !== "undefined") {
                if (value instanceof File) {
                    files[key] = value;
                } else {
                    formData.append(key, value);
                }
            }
        }

        for (const [key, file] of Object.entries(files)) {
            formData.append(key, file);
        }

        return formData;
    }
}

