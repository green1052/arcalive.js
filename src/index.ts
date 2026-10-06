import {Http, type HttpOptions} from "./internal/http.ts";
import {AuthApi} from "./api/auth.ts";
import {ChannelsApi} from "./api/channels.ts";
import {ChannelApi} from "./api/channel.ts";
import {NotificationsApi} from "./api/notifications.ts";
import {MiscApi} from "./api/misc.ts";
import {EmoticonsApi} from "./api/emoticons.ts";
import {UsersApi} from "./api/users.ts";
import {ReportsApi} from "./api/reports.ts";

/**
 * arca.live 비공식 API 클라이언트 — 공앱(app-v2-85) 프로토콜 재현.
 *
 * ky(fetch 래퍼) 기반. 각 API 영역은 subobject로 노출:
 *
 * ```ts
 * const arca = new ArcaClient({token: "..."});
 * const me = await arca.auth.me();
 * for await (const a of arca.channel("bluearchive").articlePages({limit: 30})) {
 *     console.log(a.id, a.title);
 * }
 * const {articleId} = await arca.channel("b").postArticle({title: "t", content: "<p>본문</p>"});
 * await arca.channel("b").article(articleId).comments().create({content: "댓글"});
 * await arca.reports.submit("article", articleId, {description: "신고 사유"});
 * ```
 *
 * 토큰은 로그인 시 서버가 발급하는 Bearer 토큰(PREFS_LAST_USER_TOKEN).
 * 신고(reports)/글쓰기(postArticle)는 WebView 웹 폼 플로우 재현으로
 * SSO 세션을 자동 발급한다 — 간헐적 Cloudflare 챌린지는 `HttpOptions.fetch`로 우회.
 */
export class ArcaClient {
    readonly http: Http;
    readonly auth: AuthApi;
    readonly channels: ChannelsApi;
    readonly notifications: NotificationsApi;
    readonly misc: MiscApi;
    readonly emoticons: EmoticonsApi;
    readonly users: UsersApi;
    readonly reports: ReportsApi;

    constructor(opts: HttpOptions = {}) {
        this.http = new Http(opts);
        this.auth = new AuthApi(this.http);
        this.channels = new ChannelsApi(this.http);
        this.notifications = new NotificationsApi(this.http);
        this.misc = new MiscApi(this.http);
        this.emoticons = new EmoticonsApi(this.http);
        this.users = new UsersApi(this.http);
        this.reports = new ReportsApi(this.http);
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
export {ReportsApi, type ReportTarget, type ReportForm, type SubmitReportParams} from "./api/reports.ts";
export {ArcaApiError} from "./errors.ts";
export * from "./types.ts";
export type {Http, HttpOptions} from "./internal/http.ts";