import {form, type Http} from "../internal/http.ts";
import type {Result, TokenBundle, User} from "../types.ts";

export class AuthApi {
    constructor(private http: Http) {}

    /** POST /api/app/user/logout */
    async logout(): Promise<void> {
        await this.http.api.post("/api/app/user/logout").json();
        this.http.token = null;
    }

    /** GET /api/v2/me */
    me(): Promise<User> {
        return this.http.api.get("/api/v2/me").json<User>();
    }

    /** GET /api/app/sso-token */
    ssoToken(): Promise<TokenBundle> {
        return this.http.api.get("/api/app/sso-token").json<TokenBundle>();
    }

    /** POST /api/app/push/register — FCM 푸시 토큰 등록. */
    registerPush(pushToken: string): Promise<void> {
        return this.http.api.post("/api/app/push/register", form({pushToken})).json<void>();
    }

    /** POST /api/app/qrlogin — QR 토큰 인증 (로그인/세션 연결 겸용) */
    qrLogin(qrToken: string): Promise<Result> {
        return this.http.api.post("/api/app/qrlogin", form({token: qrToken})).json<Result>();
    }
}
