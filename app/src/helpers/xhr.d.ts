import {AxiosPromise} from "axios";

interface WikiAPIRequest {
    url: string,
    method: string,
    data: string,
    headers: [],
}

export function buildRequest(url: string, data?: object, method?: string): WikiAPIRequest;
export function send(request: WikiAPIRequest): AxiosPromise;
export function configureStores(newAuthStore: any, newLoadingStore: any): void;