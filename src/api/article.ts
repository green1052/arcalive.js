import type {Http} from "../internal/http.ts";
import type {Article, Rating} from "../types.ts";
import {CommentsApi} from "./comments.ts";

export class ArticleApi {
    constructor(
        private http: Http,
        readonly slug: string,
        readonly id: number
    ) {}

    /** GET /api/app/view/article/{slug}/{articleId} */
    view(opts?: { viewCount?: boolean; mainImage?: boolean }): Promise<Article> {
        return this.http.get<Article>(`/api/app/view/article/${this.slug}/${this.id}`, {searchParams: opts});
    }

    /** POST /api/app/article/{slug}/{articleId}/scrap */
    scrap(): Promise<void> {
        return this.http.postEmpty(`/api/app/article/${this.slug}/${this.id}/scrap`);
    }

    /** DELETE /api/app/article/{slug}/{articleId}/scrap */
    unscrap(): Promise<void> {
        return this.http.delete(`/api/app/article/${this.slug}/${this.id}/scrap`);
    }

    /** POST /api/app/rate/{slug}/{articleId} — value: 1(추천) | -1(비추천) */
    rate(value: 1 | -1, recaptchaResponse?: string): Promise<Rating> {
        const form: Record<string, string | number> = {value};
        if (recaptchaResponse) form["g-recaptcha-response"] = recaptchaResponse;
        return this.http.postForm<Rating>(`/api/app/rate/${this.slug}/${this.id}`, form);
    }

    /** PUT /api/app/article/{slug}/{articleId}/notice — value: 0|1 */
    setNotice(value: 0 | 1): Promise<void> {
        return this.http.putQuery(`/api/app/article/${this.slug}/${this.id}/notice`, {value});
    }

    /** PUT /api/app/article/{slug}/{articleId}/setHeadline — value: 0|1 */
    setHeadline(value: 0 | 1): Promise<void> {
        return this.http.putQuery(`/api/app/article/${this.slug}/${this.id}/setHeadline`, {value});
    }

    /** PUT /api/app/article/{slug}/{articleId}/setLive — value: 0|1 */
    setLive(value: 0 | 1): Promise<void> {
        return this.http.putQuery(`/api/app/article/${this.slug}/${this.id}/setLive`, {value});
    }

    /** PUT /api/app/article/{slug}/{articleId} — 게시글 수정 (Field: password 필요). 명세 미조사 필드는 TODO. */
    editArticle(params: Record<string, string | number>): Promise<void> {
        return this.http.putForm(`/api/app/article/${this.slug}/${this.id}`, params);
    }

    /** POST /api/app/article/{slug}/{articleId} — 게시글 삭제 (QueryMap). 명세 미조사 필드는 TODO. */
    deleteArticle(params?: Record<string, string | number>): Promise<void> {
        return this.http.postForm(`/api/app/article/${this.slug}/${this.id}`, params ?? {});
    }

    /** 댓글 진입점 */
    comments(): CommentsApi {
        return new CommentsApi(this.http, this.slug, this.id);
    }
}