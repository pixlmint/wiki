import {defineStore} from "pinia";
import {BoardResponse} from "@/src/contracts/Kanban";
import {buildRequest, send} from "pixlcms-wrapper";
import {useWikiStore} from '@/src/stores/wiki';
import {ElNotification} from "element-plus";
import {AxiosResponse} from "axios";

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
        loadBoard(boardId: string) {
            const request = buildRequest('/api/board/load', {board: boardId});
            return send(request).then((response: Response) => {
                this.loadedBoard = response.data.board;
                return response;
            });
        },
        createBoard(parentFolder: string, boardName: string) {
            const request = buildRequest('/api/board/create', {parentPage: parentFolder, name: boardName}, 'POST');
            return send(request);
        },
        createListItem(listId: string, name: String) {
            const request = buildRequest('/api/board/list/card/create', {listId: listId, name: name}, 'POST');
            return send(request).then((response: AxiosResponse) => {
                return response;
            });
        },
        moveCard(targetListUid: string, cardUid: string) {
            const request = buildRequest('/api/board/move-card', {targetListUid: targetListUid, cardUid: cardUid}, 'PUT');
            return send(request).then((response: AxiosResponse) => {
                console.log(response);
            });
        },
        createList(boardId: string, listName: string) {
            if (this.loadedBoard === null) {
                throw 'no board';
            }
            const request = buildRequest('/api/board/list/create', {boardId: boardId, name: listName}, 'POST');
            return send(request).then((response: AxiosResponse) => {
                this.loadBoard(boardId);
                return response;
            });
        },
    }
});