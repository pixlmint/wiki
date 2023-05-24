import {defineStore} from 'pinia'

interface State {
    loadingCount: number,
    loadingTime: number,
    timePassed: number,
    estimatedProgress: number,
}

export const useLoadingStore = defineStore('loadingStore', {
    state: (): State => ({
        loadingCount: 0,
        loadingTime: 0,
        timePassed: 0,
        estimatedProgress: 0,
    }),
    getters: {
        getLoadingCount: state => state.loadingCount,
        getLoadingTime: state => state.loadingTime,
        getTimePassed: state => state.timePassed,
        getEstimatedProgress: state => state.estimatedProgress,
    },
    actions: {
        increaseLoadingCount() {
            this.loadingCount += 1;
        },
        decreaseLoadingCount() {
            this.loadingCount -= 1;
        },
        updateTimePassed(newTime: number) {
            this.timePassed = newTime;
        },
        increaseTimePassed(newTime: number) {
            this.timePassed += newTime;
        },
        increaseLoadingTime(additionalLoadingTime: number) {
            this.loadingTime += additionalLoadingTime;
        },
        updateEstimatedProgress(newEstimatedProgress: number) {
            this.estimatedProgress = newEstimatedProgress;
        },
        resetLoadingBar() {
            this.loadingCount = 0;
            this.loadingTime = 0;
            this.timePassed = 0;
            this.estimatedProgress = 0;
        },
    },
})
