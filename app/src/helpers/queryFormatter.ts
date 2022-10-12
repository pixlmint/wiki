function queryFormatter(data: any) {
    return Object.keys(data)
        .map((key) => key + '=' + data[key])
        .join('&')
}

export {queryFormatter}