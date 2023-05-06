import axios from "axios";
import {queryFormatter} from "./queryFormatter";
import {useLoadingStore} from "../stores/loading";
import LoadingHelper from "./LoadingHelper";
import {ElNotification} from "element-plus";

const updateSpeed = 10;

let loadingBarInterval = null;
let store = null;
window.setTimeout(() => {
    store = useLoadingStore();
}, 100);

export function buildRequest(url, data = {}, method = 'GET') {
    method = method.toUpperCase();
    const request = {
        url: url,
        method: method,
    }
    if (method === 'GET' || method === 'DELETE') {
        request.url = url + '?' + queryFormatter(data);
    } else {
        if (data instanceof FormData) {
            request.data = data;
        } else {
            request.data = queryFormatter(data);
            request.headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
        }
    }

    return request;
}

function clearProgressBar() {
    const estimated = store.getEstimatedProgress;
    if (estimated >= 100) {
        store.resetLoadingBar();
        window.clearInterval(loadingBarInterval);
        loadingBarInterval = null;
    } else {
        store.updateEstimatedProgress(estimated + 5)
    }
}

function updateLoadingProgress() {
    store.increaseTimePassed(updateSpeed);
    const newProgress = 100 / store.getLoadingTime * store.getTimePassed;
    store.updateEstimatedProgress(newProgress);

    if (store.getLoadingCount <= 0) {
        window.clearInterval(loadingBarInterval);
        loadingBarInterval = window.setInterval(clearProgressBar, updateSpeed);
    }
}

export function send(request) {
    const startTime = new Date();
    if (store !== null) {
        store.increaseLoadingCount();
        store.increaseLoadingTime(LoadingHelper.getAverageLoadingTime(request.url));
        if (loadingBarInterval === null) {
            loadingBarInterval = window.setInterval(updateLoadingProgress, updateSpeed);
        }
    }
    return axios(request)
        .then((response) => {
            if (store !== null) {
                store.decreaseLoadingCount();
            }
            const endTime = new Date();
            const diff = endTime - startTime;
            LoadingHelper.updateAverageLoadingTime(request.url, diff);
            return response;
        })
        .catch((reason) => {
            let message = 'Error Sending Request to ' + request.url;
            if ('message' in reason.response.data) {
                message = reason.response.data.message;
            }
            ElNotification({
                title: 'Error',
                message: message,
                type: 'warning',
            });
            if (store !== null) {
                store.decreaseLoadingCount();
                if (store.getLoadingTime === 0) {
                    window.clearInterval(loadingBarInterval);
                }
            }
            return reason;
        });
}