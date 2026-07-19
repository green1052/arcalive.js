import type {Http} from "../internal/http.ts";
import type {Comment, CommentsListQuery} from "../types.ts";
import {CommentApi} from "./comment.ts";

export interface PostCommentParams {
    content?: string;
    contentType?: string;
    password?: string;
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