export function navigate(url: string) {
    history.pushState({url: url}, '', url);
    const pushStateEvent = new PushStateEvent('pushstate', location.pathname, url);
    window.dispatchEvent(pushStateEvent);
}


export class PushStateEvent extends Event {
    public readonly oldUrl: string;
    public readonly newUrl: string;

    constructor(type: string, oldUrl: string, newUrl: string) {
        super(type, {bubbles: true, cancelable: true});
        this.oldUrl = oldUrl;
        this.newUrl = newUrl;
    }
}