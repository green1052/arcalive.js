import type {Http} from "../internal/http.ts";
import type {ArticlesResponse, Channel, ChannelMeta, ScrapListQuery} from "../types.ts";
import {ChannelApi} from "./channel.ts";

export class ChannelsApi {
    constructor(private http: Http) {}

    /** GET /api/app/list/channels */
    list(): Promise<Channel[]> {
        return this.http.api.get("/api/app/list/channels").json<Channel[]>();
    }

    /** GET /api/app/list/channels/main */
    main(): Promise<ChannelMeta[]> {
        return this.http.api.get("/api/app/list/channels/main").json<ChannelMeta[]>();
    }

    /** GET /api/app/list/channels/my */
    my(): Promise<Channel[]> {
        return this.http.api.get("/api/app/list/channels/my").json<Channel[]>();
    }

    /** GET /api/app/scrap_list */
    scrapList(query?: ScrapListQuery): Promise<ArticlesResponse> {
        return this.http.api.get("/api/app/scrap_list", {searchParams: query}).json<ArticlesResponse>();
    }

    /** 특정 채널 진입점 */
    channel(slug: string): ChannelApi {
        return new ChannelApi(this.http, slug);
    }
}
