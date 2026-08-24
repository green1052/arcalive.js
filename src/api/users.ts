import type {Http} from "../internal/http.ts";
import type {RecentBundle} from "../types.ts";

export interface RecentQuery {
    nickname?: string;
    publicId?: number;

    [key: string]: string | number | undefined;
}

export class UsersApi {
    constructor(private http: Http) {}

    /** GET /api/app/users/recent — 사용자 최근 활동(게시글/댓글/프로필). */
    recent(query?: RecentQuery): Promise<RecentBundle> {
        return this.http.get<RecentBundle>("/api/app/users/recent", {searchParams: query});
    }
}
