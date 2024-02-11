import {defineStore} from "pinia";
import {BoardResponse} from "@/src/contracts/Kanban";
import {buildRequest, send} from "pixlcms-wrapper";

interface State {
    loadedBoard: BoardResponse | null
}

export const useBoardStore = defineStore('boardStore', {
    state: (): State => ({
        loadedBoard: null,
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
        loadBoard(boardId: string) {
            const request = buildRequest('/api/board/load', {board: boardId});
            return send(request).then((response: Response) => {
                this.loadedBoard = response.data.board;
                return response;
            });
        },
    }
});