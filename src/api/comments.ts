import {form, type Http} from "../internal/http.ts";
import {paginateItems} from "../internal/paginate.ts";
import type {Comment, CommentsListQuery} from "../types.ts";

/** 댓글 작성 파라미터. */
export interface PostCommentParams {
    /** 본문 (contentType 생략 시 "text"). */
    content?: string;
    /** 콘텐츠 타입: "text" | "html" | "emoticon" | "combo_emoticon". */
    contentType?: string;
    /** 비밀번호 (비회원 댓글). */
    password?: string;
    /** 대댓글인 경우 부모 댓글 id. */
    parentId?: number;
    /** 아카콘 댓글: 이모티콘 "세트" id (emoticons.list()의 id). */
    emoticonId?: string;
    /** 아카콘 댓글: 세트 내 이모티콘 item id (emoticons.items()의 id). */
    attachmentId?: string;

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
        return this.http.api.get(`/api/app/list/comment/${this.slug}/${this.articleId}`, {searchParams: query}).json<Comment[]>();
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

    /** POST /api/app/comment/{slug}/{articleId} — contentType 미지정 시 "text" */
    create(params: PostCommentParams): Promise<Comment> {
        return this.http.api.post(`/api/app/comment/${this.slug}/${this.articleId}`, form({
            contentType: "text",
            ...params,
        })).json<Comment>();
    }

    /**
     * 아카콘 댓글 작성 — 실측 검증 포맷: `contentType="emoticon"`, `emoticonId`=세트 id, `attachmentId`=item id.
     * 필드명이 직관과 반대라 헬퍼로 제공 (공앱 EmoticonSelection 기준).
     */
    createEmoticon(emoticonSetId: number, itemId: number): Promise<Comment> {
        return this.create({contentType: "emoticon", emoticonId: String(emoticonSetId), attachmentId: String(itemId)});
    }

    /** PUT /api/app/comment/{slug}/{articleId}/{commentId} — 댓글 수정 */
    edit(commentId: number, params: EditCommentParams): Promise<Comment> {
        return this.http.api.put(`/api/app/comment/${this.slug}/${this.articleId}/${commentId}`, form(params)).json<Comment>();
    }

    /** PUT /api/app/comment/{slug}/{articleId}/{commentId} — 댓글 삭제 (form: password, 로그인 계정은 빈 값. 실측 m11556i). */
    delete(commentId: number, password = ""): Promise<void> {
        return this.http.api.put(`/api/app/comment/${this.slug}/${this.articleId}/${commentId}`, form({password})).json<void>();
    }

    /** POST /api/app/disableNotification/{slug}/{articleId}/{commentId} — 댓글 알림 끄기. value: 0|1 */
    disableNotification(commentId: number, value: 0 | 1): Promise<void> {
        return this.http.api.post(`/api/app/disableNotification/${this.slug}/${this.articleId}/${commentId}`, form({value})).json<void>();
    }
}
