import type {Http} from "../internal/http.ts";
import type {NewsBundle, NoticeResponse, UploadResponse, Version, VoteResponse} from "../types.ts";

/** 투표 생성 파라미터. */
export interface CreateVoteParams {
    /** 투표 제목. */
    title: string;
    /** 투표 항목. */
    items: string[];
    /** 복수 선택 허용 수. */
    multiSelectLimit?: number;
    votePermission?: number;
    expireDay?: number;
    expireHour?: number;
    expireMin?: number;
}

/** 업로드 파라미터. */
export interface UploadParams {
    /** 업로드 토큰 (채널/세션에서 발급). */
    token: string;
    /** 용도 — 공앱 확인값: "voicecomment" (음성 댓글). */
    purpose: string;
    /** 파일명. 기본 "upload". */
    filename?: string;
}

export class MiscApi {
    constructor(private http: Http) {}

    /** GET /api/v2/version — 최신 앱 버전. */
    version(): Promise<Version> {
        return this.http.get<Version>("/api/v2/version");
    }

    /** GET /api/notice — 서비스 공지. */
    notice(): Promise<NoticeResponse> {
        return this.http.get<NoticeResponse>("/api/notice");
    }

    /** GET /api/bywiki.json — 뉴스. */
    news(): Promise<NewsBundle> {
        return this.http.get<NewsBundle>("/api/bywiki.json");
    }

    /** POST /app/api/create_vote — 투표 생성. 항목은 vote_items 필드로 반복 인코딩. */
    createVote(params: CreateVoteParams): Promise<VoteResponse> {
        return this.http.postForm<VoteResponse>("/app/api/create_vote", {
            voteTitle: params.title,
            vote_items: params.items,
            multiSelectLimit: params.multiSelectLimit,
            votePermission: params.votePermission,
            expire_day: params.expireDay,
            expire_hour: params.expireHour,
            expire_min: params.expireMin,
        });
    }

    /**
     * POST multipart /api/app/upload — 파일 업로드.
     * 파일 part명 "upload". 응답 idx/url을 본문 media 요소 등에 사용.
     */
    upload(file: Blob, params: UploadParams): Promise<UploadResponse> {
        const form = new FormData();
        form.set("token", params.token);
        form.set("upload", file, params.filename ?? "upload");
        form.set("purpose", params.purpose);
        return this.http.postMultipart<UploadResponse>("/api/app/upload", form);
    }
}
