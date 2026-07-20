import type {Http} from "../internal/http.ts";
import type {NotificationBundle, Result} from "../types.ts";

export class NotificationsApi {
    constructor(private http: Http) {}

    /**
     * GET /api/v2/notifications — 전체 알림.
     * @param at 기준 시각(UNIX ms). 지정 시 해당 시각 이후 알림만 조회.
     */
    all(at?: number): Promise<NotificationBundle> {
        return this.http.get<NotificationBundle>("/api/v2/notifications", {searchParams: at != null ? {at} : undefined});
    }

    /**
     * GET /api/v2/notifications/mentiond — 멘션 알림 (경로 오타 원본 그대로).
     * @param at 기준 시각(UNIX ms).
     */
    mention(at?: number): Promise<NotificationBundle> {
        return this.http.get<NotificationBundle>("/api/v2/notifications/mentiond", {searchParams: at != null ? {at} : undefined});
    }

    /**
     * GET /api/v2/notifications/comment — 댓글 알림.
     * @param at 기준 시각(UNIX ms).
     */
    comment(at?: number): Promise<NotificationBundle> {
        return this.http.get<NotificationBundle>("/api/v2/notifications/comment", {searchParams: at != null ? {at} : undefined});
    }

    /**
     * GET /api/v2/notifications/report — 신고 알림.
     * @param at 기준 시각(UNIX ms).
     */
    report(at?: number): Promise<NotificationBundle> {
        return this.http.get<NotificationBundle>("/api/v2/notifications/report", {searchParams: at != null ? {at} : undefined});
    }

    /**
     * POST /api/v2/notifications — 알림 일괄 처리.
     * @param action 처리 종류 (예: "read").
     * @param tokens 대상 알림 토큰 (쉼표 구분 문자열).
     */
    read(action: string, tokens: string): Promise<Result> {
        return this.http.postForm<Result>("/api/v2/notifications", {action, tokens});
    }
}
