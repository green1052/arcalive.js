import {form, type Http} from "../internal/http.ts";
import type {Article, Rating} from "../types.ts";
import {CommentsApi} from "./comments.ts";

export class ArticleApi {
    constructor(
        private http: Http,
        readonly slug: string,
        readonly id: number
    ) {}

    private get path(): string {
        return `/api/app/article/${this.slug}/${this.id}`;
    }

    /** GET /api/app/view/article/{slug}/{articleId} */
    view(opts?: { viewCount?: boolean; mainImage?: boolean }): Promise<Article> {
        return this.http.api.get(`/api/app/view/article/${this.slug}/${this.id}`, {searchParams: opts}).json<Article>();
    }

    /** POST /api/app/article/{slug}/{articleId}/scrap */
    scrap(): Promise<void> {
        return this.http.api.post(`${this.path}/scrap`).json<void>();
    }

    /** DELETE /api/app/article/{slug}/{articleId}/scrap */
    unscrap(): Promise<void> {
        return this.http.api.delete(`${this.path}/scrap`).json<void>();
    }

    /**
     * POST /api/app/rate/{slug}/{articleId} — value: 1(추천) | -1(비추천).
     * 실측: 유효한 reCAPTCHA 토큰 없이는 405 Method Not Allowed 반환
     * (siteKey 6LcDuIwUAAAAAABqGMfC8KCTje-xWbQu9bhvIO3K, 공앱은 RecaptchaWebView 경유).
     */
    rate(value: 1 | -1, recaptchaResponse?: string): Promise<Rating> {
        return this.http.api.post(`/api/app/rate/${this.slug}/${this.id}`, form({
            value,
            "g-recaptcha-response": recaptchaResponse || undefined,
        })).json<Rating>();
    }

    /** PUT /api/app/article/{slug}/{articleId}/notice — value: 0|1 */
    setNotice(value: 0 | 1): Promise<void> {
        return this.http.api.put(`${this.path}/notice`, {searchParams: {value}}).json<void>();
    }

    /** PUT /api/app/article/{slug}/{articleId}/setHeadline — value: 0|1 */
    setHeadline(value: 0 | 1): Promise<void> {
        return this.http.api.put(`${this.path}/setHeadline`, {searchParams: {value}}).json<void>();
    }

    /** PUT /api/app/article/{slug}/{articleId}/setLive — value: 0|1 */
    setLive(value: 0 | 1): Promise<void> {
        return this.http.api.put(`${this.path}/setLive`, {searchParams: {value}}).json<void>();
    }

    /** PUT /api/app/article/{slug}/{articleId}/resetRating — 추천/비추천 초기화 (관리자). */
    resetRating(value: number): Promise<void> {
        return this.http.api.put(`${this.path}/resetRating`, {searchParams: {value}}).json<void>();
    }

    /** POST /api/app/disableNotification/{slug}/{articleId} — 게시글 알림 끄기. value: 0|1 */
    disableNotification(value: 0 | 1): Promise<void> {
        return this.http.api.post(`/api/app/disableNotification/${this.slug}/${this.id}`, form({value})).json<void>();
    }

    /** POST /api/app/article/{slug}/{articleId} — 게시글 수정 (QueryMap: title, contentType, content 등. 공앱 m11567t). */
    editArticle(params: Record<string, string | number>): Promise<void> {
        return this.http.api.post(this.path, {searchParams: params}).json<void>();
    }

    /** PUT /api/app/article/{slug}/{articleId} — 게시글 삭제 (form: password, 로그인 계정은 빈 값. 공앱 m11570w). */
    deleteArticle(password = ""): Promise<void> {
        return this.http.api.put(this.path, form({password})).json<void>();
    }

    /** 댓글 진입점 */
    comments(): CommentsApi {
        return new CommentsApi(this.http, this.slug, this.id);
    }
}
