import { PixlCms } from "pixlcms-wrapper";
import { ServiceManager } from "pixlcms-wrapper/src/services/pixlcmsService";
import { BoardService } from "./boardService";
import { WikiService } from "./wikiService";

class Wiki extends PixlCms {
    declare kanban: BoardService;
    declare wiki: WikiService

    constructor(domain?: string) {
        super(domain);

        this.kanban = new BoardService();
        this.kanban.domain = domain;
        this.kanban._buildRequest = this.createRequestBuilder();

        this.wiki = new WikiService();
        this.wiki.domain = domain;
        this.wiki._buildRequest = this.createRequestBuilder();
    }
}

class WikiServiceManager extends ServiceManager {
    declare defaultInstance: Wiki;
    declare instances: Record<string, Wiki>;

    constructor() {
        super();
        this.defaultInstance = new Wiki();
        this.instances = {};
    }

    getInstance(domain?: string) {
        if (typeof domain === 'undefined') {
            return this.defaultInstance;
        } else {
            if (!(domain in this.instances)) {
                this.instances[domain] = new Wiki(domain);
            }

            return this.instances[domain];
        }
    }
}

const wikiServiceManager = new WikiServiceManager();

export default wikiServiceManager;

export { Wiki }
