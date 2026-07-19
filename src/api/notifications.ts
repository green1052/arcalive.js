import type {Http} from "../internal/http.ts";
import type {NotificationBundle, Result} from "../types.ts";

export class NotificationsApi {
    constructor(private http: Http) {}

    /** GET /api/v2/notifications */
    all(at?: number): Promise<NotificationBundle> {
        return this.http.get<NotificationBundle>("/api/v2/notifications", {searchParams: at != null ? {at} : undefined});
    }

    /** GET /api/v2/notifications/mentiond (경로 오타 원본 그대로) */
    mention(at?: number): Promise<NotificationBundle> {
        return this.http.get<NotificationBundle>("/api/v2/notifications/mentiond", {searchParams: at != null ? {at} : undefined});
    }

    /** GET /api/v2/notifications/comment */
    comment(at?: number): Promise<NotificationBundle> {
        return this.http.get<NotificationBundle>("/api/v2/notifications/comment", {searchParams: at != null ? {at} : undefined});
    }

    /** GET /api/v2/notifications/report */
    report(at?: number): Promise<NotificationBundle> {
        return this.http.get<NotificationBundle>("/api/v2/notifications/report", {searchParams: at != null ? {at} : undefined});
    }

    /** POST /api/v2/notifications — action, tokens 일괄 처리 */
    read(action: string, tokens: string): Promise<Result> {
        return this.http.postForm<Result>("/api/v2/notifications", {action, tokens});
    }
}