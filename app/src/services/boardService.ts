import { BaseService, send } from "pixlcms-wrapper";

class BoardService extends BaseService {
    async loadBoard(boardId: string) {
        const request = this._buildRequest('/api/board/load', { board: boardId });
        return send(request);
    }

    createBoard(parentFolder: string, boardName: string) {
        const request = this._buildRequest('/api/board/create', { parentPage: parentFolder, name: boardName }, 'POST');
        return send(request);
    }

    async createListItem(listId: string, name: string) {
        const request = this._buildRequest('/api/board/list/card/create', { listId: listId, name: name }, 'POST');
        return await send(request);
    }

    async moveCard(targetListUid: string, cardUid: string) {
        const request = this._buildRequest('/api/board/move-card', {
            targetListUid: targetListUid,
            cardUid: cardUid
        }, 'PUT');
        return await send(request);
    }

    async updateBoardMeta(data: object) {
        const request = this._buildRequest('/api/admin/entry/edit', data, 'PUT');
        return send(request);
    }

    createList(boardId: string, listName: string) {
        const request = this._buildRequest('/api/board/list/create', { boardId: boardId, name: listName }, 'POST');
        return send(request);
    }
}

export { BoardService }
