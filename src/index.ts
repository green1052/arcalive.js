import {Http, type HttpOptions} from "./internal/http.ts";
import {AuthApi} from "./api/auth.ts";
import {ChannelsApi} from "./api/channels.ts";
import {ChannelApi} from "./api/channel.ts";
import {NotificationsApi} from "./api/notifications.ts";
import {MiscApi} from "./api/misc.ts";
import {EmoticonsApi} from "./api/emoticons.ts";
import {UsersApi} from "./api/users.ts";

/**
 * arca.live 비공식 API 클라이언트.
 * 각 API 영역(auth/channels/notifications/misc/emoticons/users)은 subobject로 노출.
 */
export class ArcaClient {
    readonly http: Http;
    readonly auth: AuthApi;
    readonly channels: ChannelsApi;
    readonly notifications: NotificationsApi;
    readonly misc: MiscApi;
    readonly emoticons: EmoticonsApi;
    readonly users: UsersApi;

    constructor(opts: HttpOptions = {}) {
        this.http = new Http(opts);
        this.auth = new AuthApi(this.http);
        this.channels = new ChannelsApi(this.http);
        this.notifications = new NotificationsApi(this.http);
        this.misc = new MiscApi(this.http);
        this.emoticons = new EmoticonsApi(this.http);
        this.users = new UsersApi(this.http);
    }

    get token(): string | null {
        return this.http.token;
    }

    set token(v: string | null) {
        this.http.token = v;
    }

    get deviceToken(): string {
        return this.http.deviceToken;
    }

    set deviceToken(v: string) {
        this.http.deviceToken = v;
    }

    /** 특정 채널 진입 — arca.channel("b") */
    channel(slug: string): ChannelApi {
        return this.channels.channel(slug);
    }
}

export {AuthApi} from "./api/auth.ts";
export {ChannelsApi} from "./api/channels.ts";
export {ChannelApi, type PostArticleParams} from "./api/channel.ts";
export {ArticleApi} from "./api/article.ts";
export {CommentsApi, type PostCommentParams, type EditCommentParams} from "./api/comments.ts";
export {NotificationsApi} from "./api/notifications.ts";
export {MiscApi, type CreateVoteParams, type UploadParams} from "./api/misc.ts";
export {EmoticonsApi} from "./api/emoticons.ts";
export {UsersApi, type RecentQuery} from "./api/users.ts";
export {ArcaApiError} from "./errors.ts";
export * from "./types.ts";
export type {HttpOptions} from "./internal/http.ts";
export {buildContent, textContent, type ContentPart} from "./posting.ts";