import {AxiosPromise} from "axios";

interface JournalAPIRequest {
    url: string,
    method: string,
    data: string,
    headers: [],
}

export function buildRequest(url: string, data?: object, method?: string): JournalAPIRequest;
export function send(request: JournalAPIRequest): AxiosPromise;
