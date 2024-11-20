import {Got} from "got";

export class Article {
    constructor(private client: Got, private channelId: string, private articleId: string) {
    }

    public async getInfo(): Promise<Article> {
        return this.client.get(`api/app/view/article/${this.channelId}/${this.articleId}?viewCount=true&mainImage=true`).json<Article>();
    }

    public async getComment(limit = 50, since?: string): Promise<Comment[]> {
        return this.client.get(`api/app/list/comment/${this.channelId}/${this.articleId}`, {
            searchParams: {
                limit,
                since
            }
        }).json<Comment[]>();
    }
    
    public async rate(value: 1 | -1) {
        return this.client.patch(`api/app/rate/${this.channelId}/${this.articleId}`, {
            form: {
                value
            }
        }).json();
    }
}