import {form, type Http} from "../internal/http.ts";
import type {NotificationBundle, Result} from "../types.ts";

export class NotificationsApi {
    constructor(private http: Http) {}

    /** @param at 기준 시각(UNIX ms). 지정 시 해당 시각 이후 알림만 조회. */
    private fetch(path: string, at?: number): Promise<NotificationBundle> {
        return this.http.api.get(path, {searchParams: {at}}).json<NotificationBundle>();
    }

    /** GET /api/v2/notifications — 전체 알림. */
    all(at?: number): Promise<NotificationBundle> {
        return this.fetch("/api/v2/notifications", at);
    }

    /** GET /api/v2/notifications/mentiond — 멘션 알림. */
    mention(at?: number): Promise<NotificationBundle> {
        return this.fetch("/api/v2/notifications/mentiond", at);
    }

    /** GET /api/v2/notifications/comment — 댓글 알림. */
    comment(at?: number): Promise<NotificationBundle> {
        return this.fetch("/api/v2/notifications/comment", at);
    }

    /** GET /api/v2/notifications/report — 신고 알림. */
    report(at?: number): Promise<NotificationBundle> {
        return this.fetch("/api/v2/notifications/report", at);
    }

    /**
     * POST /api/v2/notifications — 알림 일괄 처리.
     * @param action 처리 종류 (예: "read").
     * @param tokens 대상 알림 토큰 (쉼표 구분 문자열).
     */
    read(action: string, tokens: string): Promise<Result> {
        return this.http.api.post("/api/v2/notifications", form({action, tokens})).json<Result>();
    }
}
