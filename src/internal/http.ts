/**
 * HTTP 코어 — 인증 상태 + 설정된 ky 인스턴스 2개.
 *
 * - `api`: 공앱 API. `Authorization: Bearer`/`X-Device-Token` 주입, !ok → {@link ArcaApiError},
 *   빈 본문 `.json()` → undefined.
 * - `web`: 웹 폼 플로우(신고/글쓰기). 인증 헤더 없이 WebView처럼 요청하고 상태 코드 무관 Response 반환
 *   (API 토큰 헤더가 HTML 페이지에 붙으면 Cloudflare가 비브라우저로 판정해 차단함 — 실측).
 * - 둘 다 `X-Device-Token` 응답 헤더로 deviceToken 갱신, 재시도 없음 (에러는 즉시 throw).
 */
import ky, {isHTTPError, type KyInstance} from "ky";
import {ArcaApiError} from "../errors.ts";
import type {ExceptionResponse} from "../types.ts";

export const DEFAULT_BASE_URL = "https://arca.live";
export const DEFAULT_USER_AGENT = "net.umanle.arca.android/0.9.85";
/** 공앱 WebView UA (실기기 값). */
export const WEB_UA = "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36";

/** 폼 필드값. undefined/null은 스킵, 배열은 동일 필드명으로 반복 인코딩. */
export type FormValue = string | number | (string | number)[] | undefined | null;

export interface HttpOptions {
    /** Base URL. 요청 경로가 그 뒤에 붙음 (경로 포함 프록시 URL 가능). 생략 시 {@link DEFAULT_BASE_URL}. */
    baseUrl?: string;
    /** User-Agent 헤더. 생략 시 {@link DEFAULT_USER_AGENT}. */
    userAgent?: string;
    /** Bearer 토큰. null이면 Authorization 헤더 생략. */
    token?: string | null;
    /** X-Device-Token 헤더. 생략 시 무작위 UUID. 서버 응답 헤더로 갱신됨. */
    deviceToken?: string;
    /** Bun 런타임에서 사용할 HTTP/HTTPS 프록시 URL. Node에서는 무시됨. */
    proxy?: string;
    /** Node.js 런타임에서 fetch에 전달할 undici dispatcher (ProxyAgent, EnvHttpProxyAgent 등). Bun에서는 무시됨. */
    dispatcher?: RequestInit["dispatcher"];
    /**
     * 커스텀 fetch 구현 (curl-impersonate, got-scraping 등).
     * 웹 폼 플로우(신고/글쓰기)는 HTML 페이지 요청이라 fetch 계열 TLS 지문이
     * Cloudflare 챌린지에 간헐적으로 걸릴 때 브라우저 유사 fetch로 우회.
     */
    fetch?: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
}

/** 폼 객체 직렬화 — undefined/null 스킵, 배열은 동일 필드명 반복 (Retrofit @Field List와 동일 시맨틱). */
export function formBody(form: Record<string, FormValue>): URLSearchParams {
    const body = new URLSearchParams();
    for (const [k, v] of Object.entries(form)) {
        if (v === undefined || v === null) continue;
        if (Array.isArray(v)) for (const item of v) body.append(k, String(item));
        else body.set(k, String(v));
    }
    return body;
}

/** x-www-form-urlencoded 요청 옵션 — Content-Type은 공앱(Retrofit)과 동일하게 charset 없이 명시. */
export function form(data: Record<string, FormValue>, headers?: Record<string, string>) {
    return {body: formBody(data), headers: {...headers, "Content-Type": "application/x-www-form-urlencoded"}};
}

/** ky가 파싱한 에러 본문 → ExceptionResponse. JSON이 아닌 Content-Type의 JSON 문자열도 처리. */
function toException(data: unknown): ExceptionResponse | null {
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch {
            return null; // HTML/빈 본문
        }
    }
    return data && typeof data === "object" ? data as ExceptionResponse : null;
}

/** 모든 API subobject가 공유하는 인증 상태 + ky 인스턴스. */
export class Http {
    token: string | null;
    deviceToken: string;
    readonly api: KyInstance;
    readonly web: KyInstance;

    constructor(opts: HttpOptions = {}) {
        this.token = opts.token ?? null;
        this.deviceToken = opts.deviceToken ?? crypto.randomUUID();

        const {proxy, fetch: baseFetch = fetch} = opts;
        const base = ky.create({
            prefix: opts.baseUrl ?? DEFAULT_BASE_URL,
            retry: 0,
            // Bun 전용 proxy — 커스텀 fetch와 함께 지정해도 둘 다 적용
            fetch: proxy && typeof process.versions.bun === "string"
                ? (input: string | URL | Request, init?: RequestInit) => baseFetch(input, {...init, proxy} as RequestInit)
                : opts.fetch,
            dispatcher: opts.dispatcher,
            hooks: {
                afterResponse: [({response}) => {
                    const dt = response.headers.get("X-Device-Token");
                    if (dt) this.deviceToken = dt;
                }],
            },
        });

        this.api = base.extend({
            headers: {"User-Agent": opts.userAgent ?? DEFAULT_USER_AGENT},
            parseJson: text => text === "" ? undefined : JSON.parse(text),
            hooks: {
                beforeRequest: [({request}) => {
                    request.headers.set("X-Device-Token", this.deviceToken);
                    if (this.token) request.headers.set("Authorization", `Bearer ${this.token}`);
                }],
                beforeError: [({error}) =>
                    isHTTPError(error) ? new ArcaApiError(error.response.status, toException(error.data)) : error],
            },
        });

        this.web = base.extend({
            headers: {
                "User-Agent": WEB_UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "ko-KR,ko;q=0.9",
            },
            throwHttpErrors: false,
        });
    }
}
