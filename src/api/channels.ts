import type {Http} from "../internal/http.ts";
import type {ArticlesResponse, Channel, ChannelMeta, ScrapListQuery} from "../types.ts";
import {ChannelApi} from "./channel.ts";

export class ChannelsApi {
    constructor(private http: Http) {}

    /** GET /api/app/list/channels */
    list(): Promise<Channel[]> {
        return this.http.get<Channel[]>("/api/app/list/channels");
    }

    /** GET /api/app/list/channels/main */
    main(): Promise<ChannelMeta[]> {
        return this.http.get<ChannelMeta[]>("/api/app/list/channels/main");
    }

    /** GET /api/app/list/channels/my */
    my(): Promise<Channel[]> {
        return this.http.get<Channel[]>("/api/app/list/channels/my");
    }

    /** GET /api/app/scrap_list */
    scrapList(query?: ScrapListQuery): Promise<ArticlesResponse> {
        return this.http.get<ArticlesResponse>("/api/app/scrap_list", {searchParams: query});
    }

    /** 특정 채널 진입점 */
    channel(slug: string): ChannelApi {
        return new ChannelApi(this.http, slug);
    }
}