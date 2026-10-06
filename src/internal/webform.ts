/**
 * 공앱 WebView 웹 폼 플로우 재현 공용 헬퍼 (신고/글쓰기 공유).
 *
 * 공앱 시퀀스 (app-v2-85 WebViewActivity 분석):
 * 1. `GET /api/app/sso-token` → SSO JWT
 * 2. `GET /sso?goto={path}&token={sso}` → 302 + 세션 쿠키(`arca.at`, `arca.at.sig`)
 * 3. `GET {path}` + 쿠키 → 인증된 HTML 폼 (_csrf/hidden 필드 파싱)
 *
 * 주의: HTML 페이지 요청이라 fetch 계열 TLS/헤더 지문이 Cloudflare 챌린지에
 * 간헐적으로 걸림 — `HttpOptions.fetch`로 브라우저 유사 fetch 주입해 우회 가능.
 */
import {form, type FormValue, type Http} from "./http.ts";
import type {TokenBundle} from "../types.ts";

/** 쿠키 문자열 병합 — 같은 이름이면 나중 값이 승리 (세션 회전 반영용). */
export function mergeCookies(...parts: string[]): string {
    const jar = new Map<string, string>();
    for (const part of parts) {
        for (const c of part.split(";")) {
            const t = c.trim();
            if (!t) continue;
            const eq = t.indexOf("=");
            if (eq > 0) jar.set(t.slice(0, eq), t.slice(eq + 1));
        }
    }
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

const PRE_WRAP_RE = /<p class="pre-wrap">([^<]+)<\/p>/;
const H4_RE = /<h4[^>]*>([^<]+)<\/h4>/;
const HIDDEN_INPUT_RE = /<input[^>]+type="hidden"[^>]*>/g;
const NAME_RE = /name="([^"]+)"/;
const VALUE_RE = /value="([^"]*)"/;

/** 에러/안내 페이지 본문에서 사용자 메시지 추출. */
export function extractMessage(html: string): string | undefined {
    return html.match(PRE_WRAP_RE)?.[1]?.trim() ?? html.match(H4_RE)?.[1]?.trim();
}

/** HTML의 hidden input 전체를 name→value로 파싱 (value가 name 앞에 오는 속성 순서도 처리). */
export function parseHiddenInputs(html: string): Record<string, string> {
    const hidden: Record<string, string> = {};
    for (const m of html.matchAll(HIDDEN_INPUT_RE)) {
        const name = m[0].match(NAME_RE)?.[1];
        if (name) hidden[name] = m[0].match(VALUE_RE)?.[1] ?? "";
    }
    return hidden;
}

export interface WebPage {
    html: string;
    /** /sso 발급 + 페이지 응답 회전 병합 세션 쿠키 (이후 POST에 사용). */
    cookie: string;
}

const CF_MARK = "Just a moment";

/**
 * Http 인스턴스별 SSO 세션 쿠키 캐시 — 재호출 시 sso-token·/sso 왕복 생략 (요청 3개 → 1개).
 * 발급 당시 토큰도 기록 — 토큰 교체/로그아웃 후 이전 계정 세션 재사용 방지.
 */
const sessionCache = new WeakMap<Http, {token: string | null; cookie: string}>();

/** 응답 Set-Cookie → `name=value; ...` 요청 쿠키 문자열. */
function responseCookies(res: Response): string {
    return (res.headers.getSetCookie?.() ?? []).map(c => c.split(";")[0]).join("; ");
}

/** 쿠키로 페이지 GET. CF 챌린지면 throw. */
async function fetchPage(http: Http, path: string, cookie: string): Promise<WebPage> {
    const pageRes = await http.web.get(path, {headers: cookie ? {Cookie: cookie} : undefined});
    const html = await pageRes.text();
    if (html.includes(CF_MARK)) throw new Error("Cloudflare 챌린지 차단");
    return {html, cookie: mergeCookies(cookie, responseCookies(pageRes))};
}

/**
 * SSO 인증 페이지 GET. 세션 쿠키 유효하면 페이지 GET만 수행(왕복 2개 생략),
 * 만료(폼 없음) 시에만 전체 플로우로 재인증. CF 차단/API 에러는 재시도 없이 즉시 throw.
 */
export async function fetchWithSso(http: Http, path: string): Promise<WebPage> {
    const cached = sessionCache.get(http);
    sessionCache.delete(http);
    const token = http.token;
    if (cached?.token === token) {
        const page = await fetchPage(http, path, cached.cookie);
        if (page.html.includes("_csrf")) {
            sessionCache.set(http, {token, cookie: page.cookie});
            return page;
        }
        // 폼 없음 = 세션 만료 → 전체 재인증
    }

    const sso = await http.api.get("/api/app/sso-token").json<TokenBundle>();
    const ssoRes = await http.web.get("/sso", {searchParams: {goto: path, token: sso.token}, redirect: "manual"});
    const page = await fetchPage(http, path, responseCookies(ssoRes));
    if (!page.html.includes("_csrf")) throw new Error(extractMessage(page.html) ?? "SSO 세션 무효 (폼 없음)");
    sessionCache.set(http, {token, cookie: page.cookie});
    return page;
}

/** 세션 쿠키로 웹 폼 POST — 리다이렉트는 따라가지 않음 (호출자가 Location으로 판정). */
export function postWebForm(http: Http, path: string, cookie: string, data: Record<string, FormValue>): Promise<Response> {
    return http.web.post(path, {...form(data, {Cookie: cookie}), redirect: "manual"});
}
