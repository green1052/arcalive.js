import type {Http} from "../internal/http.ts";
import type {Result, TokenBundle, User} from "../types.ts";

export class AuthApi {
    constructor(private http: Http) {}

    /** POST /api/app/user/logout */
    async logout(): Promise<void> {
        await this.http.postEmpty("/api/app/user/logout");
        this.http.token = null;
    }

    /** GET /api/v2/me */
    me(): Promise<User> {
        return this.http.get<User>("/api/v2/me");
    }

    /** GET /api/app/sso-token */
    ssoToken(): Promise<TokenBundle> {
        return this.http.get<TokenBundle>("/api/app/sso-token");
    }

    /** POST /api/app/push/register — FCM 푸시 토큰 등록. */
    registerPush(pushToken: string): Promise<void> {
        return this.http.postForm("/api/app/push/register", {pushToken});
    }

    /** POST /api/app/qrlogin — QR 토큰 인증 (로그인/세션 연결 겸용) */
    qrLogin(qrToken: string): Promise<Result> {
        return this.http.postForm<Result>("/api/app/qrlogin", {token: qrToken});
    }
}
