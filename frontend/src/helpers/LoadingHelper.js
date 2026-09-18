const defaultTime = 200;
const defaultObject = {
    url: '',
    averageLoadingTime: 0,
    loadCount: 0,
}
const localStorageName = 'loadingTimes';

function updateAverageLoadingTime(url, newTime) {
    const loadingTimeObject = getAverageLoadingTimeObject(url);
    const newLoadingTime = calculateNewAverageLoadingTime(loadingTimeObject, newTime);
    const newLoadingTimeObject = {
        url: url,
        averageLoadingTime: newLoadingTime,
        loadCount: loadingTimeObject.loadCount + 1,
    };

    const newArray = replaceTimeObjectsInArray(loadingTimeObject, newLoadingTimeObject);
    storeAverageLoadingTimes(newArray);

    return newLoadingTimeObject;
}

function getAverageLoadingTime(url) {
    const obj = getAverageLoadingTimeObject(url);

    if (obj.averageLoadingTime === 0) {
        return defaultTime;
    }

    return obj.averageLoadingTime;
}

function calculateNewAverageLoadingTime(loadingTimeObject, newLoadingTime) {
    return (loadingTimeObject.averageLoadingTime * loadingTimeObject.loadCount + newLoadingTime) / (loadingTimeObject.loadCount + 1)
}

function replaceTimeObjectsInArray(oldObject, newObject) {
    const arr = getAverageLoadingTimes();
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].url === oldObject.url) {
            arr[i] = newObject;
            return arr;
        }
    }
    arr.push(newObject);

    return arr;
}

function storeAverageLoadingTimes(averageLoadingTimes) {
    const obj = JSON.stringify(averageLoadingTimes);
    localStorage.setItem(localStorageName, obj);
}

function getAverageLoadingTimeObject(url) {
    const loadingTimes = getAverageLoadingTimes();
    return getAverageLoadingTimeForUrl(url, loadingTimes);
}

function getAverageLoadingTimes() {
    const loadingTimesJSON = localStorage.getItem(localStorageName);

    if (loadingTimesJSON === undefined || loadingTimesJSON === null) {
        return [];
    }

    return JSON.parse(loadingTimesJSON);
}

function getAverageLoadingTimeForUrl(url, averageLoadingTimes) {
    for (let i = 0; i < averageLoadingTimes.length; i++) {
        if (averageLoadingTimes[i].url === url) {
            return averageLoadingTimes[i];
        }
    }

    return defaultObject;
}

export default {
    updateAverageLoadingTime,
    getAverageLoadingTime,
};