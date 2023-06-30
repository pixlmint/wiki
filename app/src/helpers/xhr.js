import axios from "axios";
import {queryFormatter} from "./queryFormatter";
import LoadingHelper from "./LoadingHelper";
import {ElNotification} from "element-plus";

// Routes where the loading bar won't be triggered
const ignoredRoutes = [
    '/api/admin/entry/edit',
]

const updateSpeed = 10;

let loadingBarInterval = null;

let authStore = null;
let loadingStore = null;

export function configureStores(newAuthStore, newLoadingStore) {
    authStore = newAuthStore;
    loadingStore = newLoadingStore;
}

export function buildRequest(url, data = {}, method = 'GET') {
    method = method.toUpperCase();
    const request = {
        url: url,
        method: method,
        headers: {},
    }
    if (authStore.getToken !== null) {
        request.headers.pixltoken = authStore.getToken;
    }
    if (method === 'GET') {
        request.url = url + '?' + queryFormatter(data);
    } else {
        if (data instanceof FormData) {
            request.data = data;
        } else {
            request.data = queryFormatter(data);
            request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
    }

    return request;
}

function clearProgressBar() {
    const estimated = loadingStore.getEstimatedProgress;
    if (estimated >= 100) {
        loadingStore.resetLoadingBar();
        window.clearInterval(loadingBarInterval);
        loadingBarInterval = null;
    } else {
        loadingStore.updateEstimatedProgress(estimated + 5)
    }
}

function updateLoadingProgress() {
    loadingStore.increaseTimePassed(updateSpeed);
    const newProgress = 100 / loadingStore.getLoadingTime * loadingStore.getTimePassed;
    loadingStore.updateEstimatedProgress(newProgress);

    if (loadingStore.getLoadingCount <= 0) {
        window.clearInterval(loadingBarInterval);
        loadingBarInterval = window.setInterval(clearProgressBar, updateSpeed);
    }
}

function isRouteIgnored(route) {
    route = route.split('?');
    return ignoredRoutes.includes(route[0]);
}

export function send(request) {
    const ignoreRoute = isRouteIgnored(request.url);
    const startTime = new Date();
    if (loadingStore !== null && !ignoreRoute) {
        loadingStore.increaseLoadingCount();
        loadingStore.increaseLoadingTime(LoadingHelper.getAverageLoadingTime(request.url));
        if (loadingBarInterval === null) {
            loadingBarInterval = window.setInterval(updateLoadingProgress, updateSpeed);
        }
    }
    return axios(request)
        .then((response) => {
            if (loadingStore !== null && !ignoreRoute) {
                loadingStore.decreaseLoadingCount();
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
            if (loadingStore !== null && !ignoreRoute) {
                loadingStore.decreaseLoadingCount();
                if (loadingStore.getLoadingTime === 0) {
                    window.clearInterval(loadingBarInterval);
                }
            }
            return reason;
        });
}