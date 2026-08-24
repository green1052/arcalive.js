import type {Http} from "../internal/http.ts";
import {paginateItems} from "../internal/paginate.ts";
import type {Article, ArticlePostingMetadata, ArticlesResponse, BatchResponse, Block, ChannelArticlesQuery, ChannelResponse, Result} from "../types.ts";
import {buildContent, type ContentPart} from "../posting.ts";
import {ArticleApi} from "./article.ts";

/** 게시글 작성 파라미터. */
export interface PostArticleParams {
    title?: string;
    /**
     * 본문. string = 그대로 전달,
     * ContentPart[] = buildContent 자동 호출로 JSON 배열 문자열 생성.
     */
    content?: string | ContentPart[];
    category?: string;
    /** 게시글 edit token (auth token과 별개). */
    token?: string;
    /** 성인/민감 콘텐츠 플래그 (string으로 전달). */
    isSensitive?: string;
    "g-recaptcha-response"?: string;
    /** 비회원 게시글 비밀번호. */
    password?: string;

    [key: string]: string | ContentPart[] | undefined;
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

    /**
     * 게시글 목록을 `next` 커서 따라 끝까지 순회. item 단위로 yield.
     * ```ts
     * for await (const a of ch.articlePages({limit: 30})) console.log(a.id);
     * ```
     */
    articlePages(query?: ChannelArticlesQuery): AsyncIterableIterator<Article> {
        return paginateItems<Article>(this.http, `/api/app/list/channel/${this.slug}`, query, (json) => {
            const data = json as ArticlesResponse;
            return {items: data.articles ?? [], next: data.next ?? undefined};
        });
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
     * POST /api/app/channels/{slug}/users/block — 사용자 차단.
     * 공앱은 QueryMap으로 전달 (nickname/publicId 등).
     */
    blockUser(params: Record<string, string | number>): Promise<Block> {
        return this.http.postEmpty<Block>(`/api/app/channels/${this.slug}/users/block`, {searchParams: params});
    }

    /** DELETE /api/app/channels/{slug}/users/block/{blockId} — 차단 해제. */
    unblockUser(blockId: number): Promise<void> {
        return this.http.delete(`/api/app/channels/${this.slug}/users/block/${blockId}`);
    }

    /**
     * POST /api/app/info/batch/{slug} — 게시글 배치 작업.
     * QueryMap: 예: {articleIds: "1,2,3", mode: "delete"} — 필드 상세는 공앱 TODO.
     */
    batchInfo(params: Record<string, string | number>): Promise<BatchResponse> {
        return this.http.postEmpty<BatchResponse>(`/api/app/info/batch/${this.slug}`, {searchParams: params});
    }

    /**
     * POST /api/app/article/{slug} — 게시글 작성.
     * @QueryMap (URL 쿼리 파라미터).
     * content는 string(직접) 또는 ContentPart[](buildContent 자동 호출).
     */
    postArticle(params: PostArticleParams): Promise<ArticlePostingMetadata> {
        const query: Record<string, string> = {};
        for (const [k, v] of Object.entries(params)) {
            if (v === undefined || v === null) continue;
            query[k] = Array.isArray(v) ? buildContent(v) : String(v);
        }
        return this.http.postEmpty<ArticlePostingMetadata>(`/api/app/article/${this.slug}`, {searchParams: query});
    }

    /** 특정 게시글 진입점 */
    article(id: number): ArticleApi {
        return new ArticleApi(this.http, this.slug, id);
    }
}
