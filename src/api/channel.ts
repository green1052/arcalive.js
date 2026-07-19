import type {Http} from "../internal/http.ts";
import type {ArticlePostingMetadata, ArticlesResponse, ChannelArticlesQuery, ChannelResponse, Result} from "../types.ts";
import {buildContent, type ContentPart} from "../posting.ts";
import {ArticleApi} from "./article.ts";

export interface PostArticleParams {
    title?: string
    /** 본문. string = 그대로 전달, ContentPart[] = buildContent 자동 호출로 JSON 배열 문자열 생성 */
    content?: string | ContentPart[]
    category?: string
    token?: string
    isSensitive?: string
    "g-recaptcha-response"?: string
    password?: string
    [key: string]: string | ContentPart[] | undefined
}

export class ChannelApi {
    constructor(private http: Http, readonly slug: string) {}

    /** GET /api/app/info/channel/{slug} */
    info(): Promise<ChannelResponse> {
        return this.http.get<ChannelResponse>(`/api/app/info/channel/${this.slug}`);
    }

    /** GET /api/app/list/channel/{slug} */
    articles(query?: ChannelArticlesQuery): Promise<ArticlesResponse> {
        return this.http.get<ArticlesResponse>(`/api/app/list/channel/${this.slug}`, {searchParams: query});
    }

    /** GET /api/app/list/channel/{slug}/notice */
    notice(): Promise<ArticlesResponse> {
        return this.http.get<ArticlesResponse>(`/api/app/list/channel/${this.slug}/notice`);
    }

    /** POST /api/app/subscribe/{slug} */
    subscribe(): Promise<Result> {
        return this.http.postEmpty<Result>(`/api/app/subscribe/${this.slug}`);
    }

    /** DELETE /api/app/subscribe/{slug} */
    unsubscribe(): Promise<Result> {
        return this.http.delete<Result>(`/api/app/subscribe/${this.slug}`);
    }

    /**
     * POST /api/app/article/{slug} — 게시글 작성.
     * @QueryMap (URL 쿼리 파라미터).
     * content는 string(직접) 또는 ContentPart[](buildContent 자동 호출).
     */
    postArticle(params: PostArticleParams): Promise<ArticlePostingMetadata> {
        const query: Record<string, string> = {}
        for (const [k, v] of Object.entries(params)) {
            if (v === undefined || v === null) continue
            query[k] = Array.isArray(v) ? buildContent(v) : String(v)
        }
        return this.http.postEmpty<ArticlePostingMetadata>(`/api/app/article/${this.slug}`, { searchParams: query })
    }

    /** 특정 게시글 진입점 */
    article(id: number): ArticleApi {
        return new ArticleApi(this.http, this.slug, id);
    }
}