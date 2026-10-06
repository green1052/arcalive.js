import type {Http} from "../internal/http.ts";
import {ArcaApiError} from "../errors.ts";
import {paginateItems} from "../internal/paginate.ts";
import type {Article, ArticlePostingMetadata, ArticlesResponse, BatchResponse, Block, ChannelArticlesQuery, ChannelResponse, Result} from "../types.ts";
import {extractMessage, fetchWithSso, parseHiddenInputs, postWebForm} from "../internal/webform.ts";
import {ArticleApi} from "./article.ts";

/** 게시글 작성 파라미터. */
export interface PostArticleParams {
    title?: string;
    /** 본문. contentType="html"이면 HTML 문자열, "text"면 플레인 텍스트. */
    content?: string;
    /** 기본 "html". */
    contentType?: string;
    category?: string;
    /** 성인/민감 콘텐츠 플래그 (string으로 전달). */
    isSensitive?: string;
    "g-recaptcha-response"?: string;
    /** 비회원 게시글 비밀번호. */
    password?: string;

    [key: string]: string | undefined;
}

export class ChannelApi {
    constructor(private http: Http, readonly slug: string) {}

    /** GET /api/app/info/channel/{slug} */
    info(): Promise<ChannelResponse> {
        return this.http.api.get(`/api/app/info/channel/${this.slug}`).json<ChannelResponse>();
    }

    /** GET /api/app/list/channel/{slug} */
    articles(query?: ChannelArticlesQuery): Promise<ArticlesResponse> {
        return this.http.api.get(`/api/app/list/channel/${this.slug}`, {searchParams: query}).json<ArticlesResponse>();
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
        return this.http.api.get(`/api/app/list/channel/${this.slug}/notice`).json<ArticlesResponse>();
    }

    /** POST /api/app/subscribe/{slug} */
    subscribe(): Promise<Result> {
        return this.http.api.post(`/api/app/subscribe/${this.slug}`).json<Result>();
    }

    /** DELETE /api/app/subscribe/{slug} */
    unsubscribe(): Promise<Result> {
        return this.http.api.delete(`/api/app/subscribe/${this.slug}`).json<Result>();
    }

    /**
     * POST /api/app/channels/{slug}/users/block — 사용자 차단.
     * 공앱은 QueryMap으로 전달 (nickname/publicId 등).
     */
    blockUser(params: Record<string, string | number>): Promise<Block> {
        return this.http.api.post(`/api/app/channels/${this.slug}/users/block`, {searchParams: params}).json<Block>();
    }

    /** DELETE /api/app/channels/{slug}/users/block/{blockId} — 차단 해제. */
    unblockUser(blockId: number): Promise<void> {
        return this.http.api.delete(`/api/app/channels/${this.slug}/users/block/${blockId}`).json<void>();
    }

    /**
     * POST /api/app/info/batch/{slug} — 게시글 배치 작업.
     * QueryMap: 예: {articleIds: "1,2,3", mode: "delete"} — 필드 상세는 공앱 TODO.
     */
    batchInfo(params: Record<string, string | number>): Promise<BatchResponse> {
        return this.http.api.post(`/api/app/info/batch/${this.slug}`, {searchParams: params}).json<BatchResponse>();
    }

    /**
     * 게시글 작성 — 웹 폼 플로우 (`POST /b/{slug}/write`) 재현.
     * 공앱의 `POST /api/app/article/{slug}`는 파라미터 검증에서 거부되어(400, 호출부 미역변환)
     * 검증된 웹 플로우로 구현: SSO 세션 → 폼 페이지(_csrf/token) → POST → JSON {slug, articleId}.
     */
    async postArticle(params: PostArticleParams): Promise<ArticlePostingMetadata> {
        const {html, cookie} = await fetchWithSso(this.http, `/b/${this.slug}/write`);
        const hidden = parseHiddenInputs(html);
        const res = await postWebForm(this.http, `/b/${this.slug}/write`, cookie, {
            _csrf: hidden["_csrf"] ?? "",
            ...params,
            token: params.token ?? hidden["token"] ?? "",
            contentType: params.contentType || "html",
        });
        const text = await res.text();
        let json: {success?: boolean; slug?: string; articleId?: number; message?: string} | null = null;
        try {
            json = JSON.parse(text);
        } catch {
            /* HTML 에러/리다이렉트 페이지 */
        }
        if (json?.success && json.articleId) {
            return {slug: json.slug ?? this.slug, articleId: json.articleId};
        }
        // 302 Location: /b/{slug}/{id}?... 형태로 성공을 알리는 경우
        const loc = res.headers.get("location");
        const m = loc?.match(/\/b\/([\w-]+)\/(\d+)/);
        if (res.status === 302 && m) {
            return {slug: m[1]!, articleId: Number(m[2])};
        }
        const msg = json?.message ?? extractMessage(text) ?? `게시글 작성 실패 (${res.status})`;
        throw new ArcaApiError(res.status, {result: false, message: msg});
    }

    /** 특정 게시글 진입점 */
    article(id: number): ArticleApi {
        return new ArticleApi(this.http, this.slug, id);
    }
}
