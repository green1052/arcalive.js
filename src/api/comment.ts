import type {Http} from "../internal/http.ts";
import type {Comment} from "../types.ts";

export interface EditCommentParams {
    content?: string;
    contentType?: string;
    password?: string;

    [key: string]: string | undefined;
}

export class CommentApi {
    constructor(
        private http: Http,
        readonly slug: string,
        readonly articleId: number,
        readonly commentId: number
    ) {}

    /** PUT /api/app/comment/{slug}/{articleId}/{commentId} — 댓글 수정 */
    edit(params: EditCommentParams): Promise<Comment> {
        const form: Record<string, string | number> = {};
        for (const [k, v] of Object.entries(params)) if (v !== undefined) form[k] = v;
        return this.http.putForm<Comment>(`/api/app/comment/${this.slug}/${this.articleId}/${this.commentId}`, form);
    }
}