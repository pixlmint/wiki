import {Drawing} from "@/src/contracts/Canvas";

export interface WikiEntry {
    raw_content: string,
    content: string,
    id: string,
    url: string,
    hidden: boolean,
    meta: EntryMeta,
    file: string,
    domain?: string,
}

export interface EntryMeta {
    title: string,
    date_formatted: string,
    description: string | null,
    author: string | null,
    owner: string | null,
    security: string | null,
    dateUpdated: string | null,
    dateCreated: string | null,
    drawings: Drawing[] | null,
}
