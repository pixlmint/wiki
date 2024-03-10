import {defineStore} from "pinia";
import {BoardResponse, CardLabel} from "@/src/contracts/Kanban";
import {buildRequest, send} from "pixlcms-wrapper";
import {useWikiStore} from '@/src/stores/wiki';
const {DateTime} = require ('luxon');

interface State {
    loadedBoard: BoardResponse | null
    lastRemovedItem: { listId: string, itemId: string } | null,
}

let wikiStore: any = null;

function getWikiStore() {
    if (wikiStore === null) {
        wikiStore = useWikiStore();
    }
    return wikiStore;
}

export const useBoardStore = defineStore('boardStore', {
    state: (): State => ({
        loadedBoard: null,
        lastRemovedItem: null,
    }),
    getters: {
        safeCurrentBoard(state: State) {
            if (state.loadedBoard === null) {
                throw 'no board';
            }
            return state.loadedBoard;
        },
    },
    actions: {
        async loadBoard(boardId: string) {
            const request = buildRequest('/api/board/load', {board: boardId});
            let response = await send(request);
            this.loadedBoard = response.data.board;
            return response;
        },
        createBoard(parentFolder: string, boardName: string) {
            const request = buildRequest('/api/board/create', {parentPage: parentFolder, name: boardName}, 'POST');
            return send(request);
        },
        async createListItem(listId: string, name: String) {
            const request = buildRequest('/api/board/list/card/create', {listId: listId, name: name}, 'POST');
            return await send(request);
        },
        async moveCard(targetListUid: string, cardUid: string) {
            const request = buildRequest('/api/board/move-card', {
                targetListUid: targetListUid,
                cardUid: cardUid
            }, 'PUT');
            return await send(request);
        },
        async updateBoardMeta(newMeta: object) {
            const now = DateTime.now();
            const data = {
                meta: newMeta,
                entry: this.safeCurrentBoard.id,
                lastUpdate: now.toFormat('yyyy-MM-dd HH:mm:ss'),
                content: this.safeCurrentBoard.raw_content,
            }

            // @ts-ignore
            this.loadedBoard.meta = newMeta;
            const request = buildRequest('/api/admin/entry/edit', data, 'PUT');
            return send(request);
        },
        async createList(boardId: string, listName: string) {
            if (this.loadedBoard === null) {
                throw 'no board';
            }
            const request = buildRequest('/api/board/list/create', {boardId: boardId, name: listName}, 'POST');
            let response = await send(request);
            await this.loadBoard(boardId);
            return response;
        },
        refreshBoard() {
            this.loadBoard(this.safeCurrentBoard.id);
        },
        getCardLabel(labelName: string): CardLabel {
            for (let label of this.safeCurrentBoard.meta.board.labels) {
                if (label.title === labelName) {
                    return label;
                }
            }

            throw 'label ' + labelName + ' not found';
        },
    }
});