import type {Http} from "../internal/http.ts";
import type {
    Article,
    ArticlePostingMetadata,
    ArticlesResponse,
    ChannelArticlesQuery,
    ChannelResponse,
    Result
} from "../types.ts";
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

/**
 * ArticlesResponse.next 커서를 따라가며 페이지 단위로 yield.
 * 클래스 메서드가 아닌 자유 함수 — dtsx가 ambient generator(`*method()`)를 잘못 뱉음(TS1221).
 */
async function* paginate<Q extends ChannelArticlesQuery>(
    fetch: (query: Q) => Promise<ArticlesResponse>,
    query?: Q
): AsyncGenerator<Article[]> {
    let cursor: Record<string, string> | undefined;
    for (;;) {
        const res = await fetch({...query, ...cursor} as Q);
        const page = res.articles ?? [];
        if (page.length) yield page;
        // 빈 페이지도 종료 조건 — 커서가 안 움직일 때 무한 루프 방지.
        if (!res.next || !page.length) return;
        cursor = res.next;
    }
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
     * 게시글 목록을 `next` 커서 따라 끝까지 순회. 페이지 단위로 yield.
     * ```ts
     * for await (const page of ch.articlePages({limit: 30})) console.log(page.length);
     * ```
     */
    articlePages(query?: ChannelArticlesQuery): AsyncGenerator<Article[]> {
        return paginate((q) => this.articles(q), query);
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
