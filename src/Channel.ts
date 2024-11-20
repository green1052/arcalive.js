import {Got} from "got";
import {Article} from "./Article.js";

export class Channel {
    constructor(private client: Got, private channelId: string) {}
    
    public article(articleId: string) {
        return new Article(this.client, this.channelId, articleId);
    }

    public async getInfo(): Promise<ChannelInfo> {
        return this.client.get(`api/app/info/channel/${this.channelId}`).json<ChannelInfo>();
    }
    
    public async getArticles(limit = 50, before?: string, offset = 1, category?: string, mode?: "best"): Promise<Articles> {
        category = category ? encodeURIComponent(category) : "";
        
        return this.client.get(`api/app/list/channel/${this.channelId}`, {
            searchParams: {
                category,
                limit,
                before,
                offset,
                mode
            }
        }).json<Articles>();
    }
}