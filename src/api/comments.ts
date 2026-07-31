import type {Http} from "../internal/http.ts";
import type {Comment, CommentsListQuery} from "../types.ts";
import {paginate} from "fetch-extras";
import {CommentApi} from "./comment.ts";

/** 댓글 작성 파라미터. */
export interface PostCommentParams {
    /** 본문. */
    content?: string;
    /** 콘텐츠 타입 (예: "text", "html"). */
    contentType?: string;
    /** 비밀번호 (비회원 댓글). */
    password?: string;
    /** 대댓글인 경우 부모 댓글 id. */
    parentId?: number;

    [key: string]: string | number | undefined;
}

export class CommentsApi {
    constructor(
        private http: Http,
        readonly slug: string,
        readonly articleId: number
    ) {}

    /** GET /api/app/list/comment/{slug}/{articleId} */
    list(query?: CommentsListQuery): Promise<Comment[]> {
        return this.http.get<Comment[]>(`/api/app/list/comment/${this.slug}/${this.articleId}`, {searchParams: query});
    }

    /**
     * 댓글 목록을 `since` 커서 따라 끝까지 순회. item 단위로 yield.
     * ```ts
     * for await (const c of ch.article(id).comments().commentPages({limit: 30})) console.log(c.id);
     * ```
     */
    commentPages(query?: CommentsListQuery): AsyncIterableIterator<Comment> {
        const url = new URL(`/api/app/list/comment/${this.slug}/${this.articleId}`, this.http.baseUrl);
        if (query) for (const [k, v] of Object.entries(query)) if (v !== undefined) url.searchParams.set(k, String(v));
        let since: number | undefined;
        return paginate<Comment>(url, {
            fetchFunction: this.http.ky,
            pagination: {
                transform: async (response) => {
                    const items = await response.json() as Comment[];
                    since = items[items.length - 1]?.id;
                    return items;
                },
                paginate: () => since ? {url: new URL(`/api/app/list/comment/${this.slug}/${this.articleId}?since=${since}${query?.limit ? `&limit=${query.limit}` : ""}`, this.http.baseUrl)} : false,
            },
        });
    }

    /** POST /api/app/comment/{slug}/{articleId} */
    create(params: PostCommentParams): Promise<Comment> {
        const form: Record<string, string | number> = {};
        for (const [k, v] of Object.entries(params)) if (v !== undefined) form[k] = v;
        return this.http.postForm<Comment>(`/api/app/comment/${this.slug}/${this.articleId}`, form);
    }

    /** 특정 댓글 진입점 */
    item(commentId: number): CommentApi {
        return new CommentApi(this.http, this.slug, this.articleId, commentId);
    }
}
