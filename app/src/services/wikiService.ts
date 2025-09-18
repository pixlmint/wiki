import { BaseService, send } from "pixlcms-wrapper";

class WikiService extends BaseService {
    rebuildIndex() {
        const request = this._buildRequest('/api/index');
        return send(request);
    }

    dumpAlternateContent(page?: string) {
        const data: { page?: string } = {};
        if (typeof page !== "undefined")
            data.page = page;
        const request = this._buildRequest('/api/admin/alternate/dump-file-into-content', data);
        return send(request);
    }

    search(query: string) {
        const request = this._buildRequest('/api/search', { q: query });
        return send(request);
    }

    addLink(link: { title: string, domain: string, parentFolder: string }) {
        const request = this._buildRequest('/api/admin/link/add', link, 'POST');
        return send(request);
    }
}

export { WikiService }
