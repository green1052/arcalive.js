import type {Http} from "../internal/http.ts";
import {paginateItems} from "../internal/paginate.ts";
import type {Comment, CommentsListQuery} from "../types.ts";

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

/** 댓글 수정 파라미터. */
export interface EditCommentParams {
    /** 본문. */
    content?: string;
    /** 콘텐츠 타입 (예: "text", "html"). */
    contentType?: string;
    /** 비밀번호 (비회원 댓글). */
    password?: string;

    [key: string]: string | undefined;
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
        return paginateItems<Comment>(this.http, `/api/app/list/comment/${this.slug}/${this.articleId}`, query, (json) => {
            const items = json as Comment[];
            const last = items[items.length - 1];
            return {items, next: last ? {since: String(last.id)} : undefined};
        });
    }

    /** POST /api/app/comment/{slug}/{articleId} */
    create(params: PostCommentParams): Promise<Comment> {
        return this.http.postForm<Comment>(`/api/app/comment/${this.slug}/${this.articleId}`, params);
    }

    /** PUT /api/app/comment/{slug}/{articleId}/{commentId} — 댓글 수정 */
    edit(commentId: number, params: EditCommentParams): Promise<Comment> {
        return this.http.putForm<Comment>(`/api/app/comment/${this.slug}/${this.articleId}/${commentId}`, params);
    }

    /** POST /api/app/disableNotification/{slug}/{articleId}/{commentId} — 댓글 알림 끄기. value: 0|1 */
    disableNotification(commentId: number, value: 0 | 1): Promise<void> {
        return this.http.postForm(`/api/app/disableNotification/${this.slug}/${this.articleId}/${commentId}`, {value});
    }
}
