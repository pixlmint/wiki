import {type EntryMeta, type WikiEntry} from "@/contracts/WikiBase";

export interface BaseBoardItemResponse extends WikiEntry {
    meta: BaseBoardItemMeta,
}

export interface BoardResponse extends BaseBoardItemResponse {
    meta: BoardMeta,
    children: ListResponse[],
}

export interface ListResponse extends BaseBoardItemResponse {
    meta: ListMeta,
}

export interface BaseBoardItemMeta extends EntryMeta {
    uid: string,
}

export interface BoardMeta extends BaseBoardItemMeta {
    board: {
        lists: String[],
        labels: CardLabel[],
    },
}

export interface ListMeta extends BaseBoardItemMeta {
    list: {
        cards: String[],
    }
}

interface BaseBoardItem {

}

export class Board implements BaseBoardItem {
    fromResponse: Function = function (response: BaseBoardItemResponse) {

    }
}

export interface CardLabel {
    title: string,
    color: string,
}
