import type {Http} from "../internal/http.ts";
import {ArcaApiError} from "../errors.ts";
import type {AuthUser, Result, TokenBundle, User} from "../types.ts";

export class AuthApi {
    constructor(private http: Http) {}

    /**
     * @deprecated 서버 라우트가 v2.280.85 기준 404 not_found_exception.
     * 공앱에서 추출한 토큰을 `new ArcaClient({ token })`로 주입해서 사용하세요.
     * 최신 APK 재분석 후 경로가 확인되면 복구 가능.
     */
    async login(_username: string, _password: string): Promise<AuthUser> {
        throw new ArcaApiError(404, {
            result: false,
            message: "login route deprecated (server 404). inject token via constructor."
        }, "login route deprecated; inject token via constructor");
    }

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

    /** POST /api/app/qrlogin — 이미 로그인된 세션에서 QR 토큰 인증 (Authorization 필요) */
    qrLoginAuthed(qrToken: string): Promise<Result> {
        return this.http.postForm<Result>("/api/app/qrlogin", {token: qrToken});
    }

    /** POST /api/app/qrlogin — 미인증 상태에서 QR 토큰으로 로그인 */
    qrLoginUnauthed(qrToken: string): Promise<Result> {
        return this.http.postForm<Result>("/api/app/qrlogin", {token: qrToken});
    }
}