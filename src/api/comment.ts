import type {Http} from "../internal/http.ts";
import type {Comment} from "../types.ts";

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
