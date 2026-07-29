import type {Http} from "../internal/http.ts";
import type {Comment, CommentsListQuery} from "../types.ts";
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

/**
 * 댓글 목록을 `since` 커서 따라가며 페이지 단위로 yield.
 * 클래스 메서드가 아닌 자유 함수 — dtsx가 ambient generator(`*method()`)를 잘못 뱉음(TS1221).
 */
async function* paginateComments(
    fetch: (query: CommentsListQuery) => Promise<Comment[]>,
    query?: CommentsListQuery
): AsyncGenerator<Comment[]> {
    let since: number | undefined;
    for (;;) {
        const page = await fetch({...query, ...(since !== undefined ? {since} : {})});
        if (page.length) yield page;
        // 빈 페이지도 종료 조건 — 커서가 안 움직일 때 무한 루프 방지.
        if (!page.length) return;
        since = page[page.length - 1].id;
    }
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
     * 댓글 목록을 `since` 커서 따라 끝까지 순회. 페이지 단위로 yield.
     * ```ts
     * for await (const page of ch.article(id).comments().commentPages({limit: 30})) console.log(page.length);
     * ```
     */
    commentPages(query?: CommentsListQuery): AsyncGenerator<Comment[]> {
        return paginateComments((q) => this.list(q), query);
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
