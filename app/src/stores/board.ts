import { defineStore } from "pinia";
import { BoardResponse, CardLabel } from "@/src/contracts/Kanban";
import { useWikiStore } from '@/src/stores/wiki';
import wikiServiceManager from "../services/wikiExtension";
const { DateTime } = require('luxon');

interface State {
    loadedBoard: BoardResponse | null
    lastRemovedItem: { listId: string, itemId: string } | null,
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
        service: () => wikiServiceManager.defaultInstance.kanban,
        async loadBoard(boardId: string) {
            return this.service().loadBoard(boardId).then(response => {
                this.loadedBoard = response.data.board;
                return response;
            });
        },
        createBoard(parentFolder: string, boardName: string) {
            return this.service().createBoard(parentFolder, boardName);
        },
        async createListItem(listId: string, name: string) {
            return this.service().createListItem(listId, name);
        },
        async moveCard(targetListUid: string, cardUid: string) {
            return this.service().moveCard(targetListUid, cardUid);
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

            return this.service().updateBoardMeta(data);
        },
        async createList(boardId: string, listName: string) {
            if (this.loadedBoard === null) {
                throw 'no board';
            }
            return this.service().createList(boardId, listName).then(() => {
                return this.loadBoard(boardId);
            });
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
