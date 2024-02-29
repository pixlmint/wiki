import {defineStore} from "pinia";
import {BoardResponse} from "@/src/contracts/Kanban";
import {buildRequest, send} from "pixlcms-wrapper";
import {useWikiStore} from '@/src/stores/wiki';

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
        localRemoveItem(listId: string, itemId: string) {
            this.lastRemovedItem = {listId, itemId};
        },
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
            let response = await send(request);
            return response;
        },
        async moveCard(targetListUid: string, cardUid: string) {
            const request = buildRequest('/api/board/move-card', {
                targetListUid: targetListUid,
                cardUid: cardUid
            }, 'PUT');
            return await send(request);
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
    }
});