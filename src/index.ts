import {Http, type HttpOptions} from "./internal/http.ts";
import {AuthApi} from "./api/auth.ts";
import {ChannelsApi} from "./api/channels.ts";
import {NotificationsApi} from "./api/notifications.ts";

/**
 * arca.live 비공식 API 클라이언트.
 * 각 API 영역(auth/channels/notifications)은 subobject로 노출.
 */
export class ArcaClient {
    readonly http: Http;
    readonly auth: AuthApi;
    readonly channels: ChannelsApi;
    readonly notifications: NotificationsApi;

    constructor(opts: HttpOptions = {}) {
        this.http = new Http(opts);
        this.auth = new AuthApi(this.http);
        this.channels = new ChannelsApi(this.http);
        this.notifications = new NotificationsApi(this.http);
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
    channel(slug: string) {
        return this.channels.channel(slug);
    }
}

export {ArcaApiError} from "./errors.ts";
export * from "./types.ts";
export type {HttpOptions} from "./internal/http.ts";
export {buildContent, textContent, type ContentPart} from "./posting.ts";