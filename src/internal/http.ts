import ky, {isHTTPError, type KyInstance, type Options} from "ky";
import {ArcaApiError} from "../errors.ts";
import type {ExceptionResponse} from "../types.ts";

export const DEFAULT_BASE_URL = "https://arca.live";
export const DEFAULT_USER_AGENT = "net.umanle.arca.android/0.9.85";

export interface HttpOptions {
    /** Base URL. 생략 시 {@link DEFAULT_BASE_URL}. */
    baseUrl?: string;
    /** User-Agent 헤더. 생략 시 {@link DEFAULT_USER_AGENT}. */
    userAgent?: string;
    /** Bearer 토큰. null이면 Authorization 헤더 생략. */
    token?: string | null;
    /** X-Device-Token 헤더. 생략 시 무작위 UUID. 서버 응답 헤더로 갱신됨. */
    deviceToken?: string;
}

/**
 * 모든 API subobject가 공유하는 HTTP 상태 컨테이너.
 * ky 인스턴스를 감싸 인증 헤더 주입, 에러 래핑, 폼/JSON 헬퍼를 제공.
 */
export class Http {
    readonly baseUrl: string;
    readonly userAgent: string;
    token: string | null;
    deviceToken: string;
    readonly ky: KyInstance;

    constructor(opts: HttpOptions = {}) {
        this.baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL;
        this.userAgent = opts.userAgent ?? DEFAULT_USER_AGENT;
        this.token = opts.token ?? null;
        this.deviceToken = opts.deviceToken ?? crypto.randomUUID();

        this.ky = ky.create({
            baseUrl: this.baseUrl,
            headers: {"User-Agent": this.userAgent},
            hooks: {
                beforeRequest: [
                    (state) => {
                        state.request.headers.set("X-Device-Token", this.deviceToken);
                        if (this.token) state.request.headers.set("Authorization", `Bearer ${this.token}`);
                    }
                ],
                afterResponse: [
                    ({response}) => {
                        const dt = response.headers.get("X-Device-Token");
                        if (dt) this.deviceToken = dt;
                    }
                ],
                beforeError: [
                    async ({error}) => {
                        if (!isHTTPError(error)) return error;
                        let body: ExceptionResponse | null = null;
                        try {
                            body = await error.response.json() as ExceptionResponse;
                        } catch {
                            body = null;
                        }
                        const msg = body?.message ?? `arca.live API error ${error.response.status}`;
                        return new ArcaApiError(error.response.status, body, msg);
                    }
                ]
            }
        });
    }

    get<T>(url: string, opts?: Options): Promise<T> {
        return this.ky.get<T>(url, opts).json<T>();
    }

    postForm<T>(url: string, form: Record<string, string | number>, opts?: Options): Promise<T> {
        const body = new URLSearchParams();
        for (const [k, v] of Object.entries(form)) body.set(k, String(v));
        return this.ky.post<T>(url, {
            ...opts,
            body,
            headers: {"Content-Type": "application/x-www-form-urlencoded"}
        }).json<T>();
    }

    postJson<T>(url: string, json?: unknown, opts?: Options): Promise<T> {
        return this.ky.post<T>(url, {...opts, json}).json<T>();
    }

    postEmpty<T = void>(url: string, opts?: Options): Promise<T> {
        return this.ky.post<T>(url, opts).json<T>();
    }

    putForm<T = void>(url: string, form?: Record<string, string | number>, opts?: Options): Promise<T> {
        if (form) {
            const body = new URLSearchParams();
            for (const [k, v] of Object.entries(form)) body.set(k, String(v));
            return this.ky.put<T>(url, {
                ...opts,
                body,
                headers: {"Content-Type": "application/x-www-form-urlencoded"}
            }).json<T>();
        }
        return this.ky.put<T>(url, opts).json<T>();
    }

    putQuery<T = void>(url: string, searchParams?: Record<string, string | number | boolean>, opts?: Options): Promise<T> {
        return this.ky.put<T>(url, {...opts, searchParams}).json<T>();
    }

    delete<T = void>(url: string, opts?: Options): Promise<T> {
        return this.ky.delete<T>(url, opts).json<T>();
    }
}
