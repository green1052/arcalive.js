/**
 * 오프라인 단위 테스트 — HTTP 코어/웹폼 파서/페이지네이션.
 * 목업 fetch로 네트워크 없이 검증 (라이브 테스트는 각 api 파일 참고).
 */
import {describe, expect, test} from "bun:test";
import {form, formBody, Http} from "../src/internal/http.ts";
import {paginateItems} from "../src/internal/paginate.ts";
import {extractMessage, fetchWithSso, mergeCookies, parseHiddenInputs} from "../src/internal/webform.ts";
import {ArcaApiError} from "../src/errors.ts";

/** 요청을 기록하고 미리 정의된 Response를 반환하는 목업 fetch (ky는 fetch(Request)로 호출). */
function mockFetch(handler: (url: string) => {status?: number; body?: string; headers?: Record<string, string>}) {
    const calls: {url: string; headers: Headers; body?: string}[] = [];
    const fn = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
        const req = input instanceof Request ? input : new Request(String(input), init);
        calls.push({
            url: req.url,
            headers: req.headers,
            body: req.body ? await new Response(req.body).text() : undefined,
        });
        const r = handler(req.url);
        return new Response(r.body || null, {status: r.status ?? 200, headers: r.headers});
    };
    return {fn, calls};
}

describe("http - 직렬화", () => {
    test("formBody — undefined/null 스킵, 배열 반복", () => {
        expect(formBody({a: 1, b: undefined, c: null, d: ["x", "y"], e: "s"}).toString())
            .toBe("a=1&d=x&d=y&e=s");
    });
});

describe("http - 목업 fetch 동작", () => {
    test("api — 인증 헤더 주입 + deviceToken 갱신", async () => {
        const m = mockFetch(() => ({body: "{}", headers: {"X-Device-Token": "server-issued"}}));
        const http = new Http({token: "T", fetch: m.fn});
        await http.api.get("/api/v2/me").json();
        expect(m.calls[0]!.headers.get("Authorization")).toBe("Bearer T");
        expect(m.calls[0]!.headers.get("X-Device-Token")).toMatch(/-/); // UUID
        expect(m.calls[0]!.headers.get("User-Agent")).toBe("net.umanle.arca.android/0.9.85");
        expect(http.deviceToken).toBe("server-issued");
    });

    test("api — 토큰 교체가 다음 요청에 반영", async () => {
        const m = mockFetch(() => ({body: "{}"}));
        const http = new Http({token: "A", fetch: m.fn});
        http.token = "B";
        await http.api.get("/x").json();
        http.token = null;
        await http.api.get("/x").json();
        expect(m.calls[0]!.headers.get("Authorization")).toBe("Bearer B");
        expect(m.calls[1]!.headers.get("Authorization")).toBeNull();
    });

    test("web — 인증 헤더 미주입, WebView UA, 에러 상태도 Response 반환", async () => {
        const m = mockFetch(() => ({status: 403, body: "<html></html>"}));
        const http = new Http({token: "T", fetch: m.fn});
        const res = await http.web.get("/sso");
        expect(res.status).toBe(403);
        expect(m.calls[0]!.headers.get("Authorization")).toBeNull();
        expect(m.calls[0]!.headers.get("X-Device-Token")).toBeNull();
        expect(m.calls[0]!.headers.get("User-Agent")).toContain("Mozilla");
    });

    test("JSON 에러 → ArcaApiError (본문 파싱)", async () => {
        const m = mockFetch(() => ({status: 403, body: JSON.stringify({result: false, message: "권한이 없습니다."})}));
        const http = new Http({fetch: m.fn});
        try {
            await http.api.get("/x").json();
            expect.unreachable();
        } catch (e) {
            expect(e).toBeInstanceOf(ArcaApiError);
            expect((e as ArcaApiError).status).toBe(403);
            expect((e as ArcaApiError).response?.message).toBe("권한이 없습니다.");
        }
    });

    test("에러 시 재시도 없음 (5xx GET도 1회만)", async () => {
        const m = mockFetch(() => ({status: 503, body: "<html>down</html>"}));
        const http = new Http({fetch: m.fn});
        const err = await http.api.get("/x").json().catch(e => e);
        expect(err).toBeInstanceOf(ArcaApiError);
        expect((err as ArcaApiError).response).toBeNull();
        expect(m.calls).toHaveLength(1);
    });

    test("빈 본문 → undefined (JSON 파싱 없음)", async () => {
        const m = mockFetch(() => ({status: 204}));
        const http = new Http({fetch: m.fn});
        expect(await http.api.post("/api/app/user/logout").json()).toBeUndefined();
    });

    test("form — 본문 직렬화 + Content-Type (charset 없음)", async () => {
        const m = mockFetch(() => ({body: "{}"}));
        const http = new Http({fetch: m.fn});
        await http.api.post("/a", form({x: "1", list: ["a", "b"]})).json();
        expect(m.calls[0]!.body).toBe("x=1&list=a&list=b");
        expect(m.calls[0]!.headers.get("Content-Type")).toBe("application/x-www-form-urlencoded");
    });

    test("searchParams undefined 스킵 + baseUrl 경로 유지", async () => {
        const m = mockFetch(() => ({body: "{}"}));
        await new Http({fetch: m.fn}).api.get("/list", {searchParams: {limit: 5, cursor: undefined}}).json();
        expect(m.calls[0]!.url).toBe("https://arca.live/list?limit=5");
        await new Http({fetch: m.fn, baseUrl: "https://proxy.example/arca"}).api.get("/api/x").json();
        expect(m.calls[1]!.url).toBe("https://proxy.example/arca/api/x");
    });
});

describe("paginate - 커서 순회", () => {
    test("next 커서 따라 끝까지 yield", async () => {
        const pages = [
            {articles: [{id: 1}, {id: 2}], next: {before: "9"}},
            {articles: [{id: 3}], next: null},
        ];
        let i = 0;
        const m = mockFetch(() => ({body: JSON.stringify(pages[i++])}));
        const http = new Http({fetch: m.fn});
        const ids: number[] = [];
        for await (const a of paginateItems(http, "/api/app/list/channel/x", {limit: 2}, json => {
            const p = json as {articles: {id: number}[]; next: Record<string, string> | null};
            return {items: p.articles, next: p.next ?? undefined};
        })) ids.push(a.id);
        expect(ids).toEqual([1, 2, 3]);
        expect(m.calls[1]!.url).toContain("limit=2");
        expect(m.calls[1]!.url).toContain("before=9");
        expect(m.calls).toHaveLength(2);
    });

    test("같은 커서 반복 시 종료 (무한 요청 방지)", async () => {
        const m = mockFetch(() => ({body: JSON.stringify({articles: [{id: 1}], next: {before: "1"}})}));
        const http = new Http({fetch: m.fn});
        const ids: number[] = [];
        for await (const a of paginateItems(http, "/x", undefined, json => {
            const p = json as {articles: {id: number}[]; next: Record<string, string>};
            return {items: p.articles, next: p.next};
        })) ids.push(a.id);
        expect(m.calls).toHaveLength(2);
        expect(ids).toEqual([1, 1]);
    });
});

describe("http - timeout", () => {
    test("timeout 옵션 적용", async () => {
        const slow = () => new Promise<Response>(r => setTimeout(() => r(new Response("{}")), 200));
        const http = new Http({fetch: slow, timeout: 50});
        const err = await http.api.get("/x").json().catch(e => e);
        expect((err as Error).name).toBe("TimeoutError");
    });
});

describe("webform - 파서", () => {
    test("parseHiddenInputs — value가 name 앞선 속성 순서 처리", () => {
        const html = `<input type="hidden" name="_csrf" value="abc">
                      <input value="local" name="report_type" type="hidden">
                      <input type="text" name="ignored" value="x">`;
        expect(parseHiddenInputs(html)).toEqual({_csrf: "abc", report_type: "local"});
    });

    test("extractMessage — pre-wrap 우선, h4 대체", () => {
        expect(extractMessage('<p class="pre-wrap">이미 신고가 접수되었습니다.</p>')).toBe("이미 신고가 접수되었습니다.");
        expect(extractMessage("<h4 class=\"card-title\">오류</h4>")).toBe("오류");
        expect(extractMessage("<p>none</p>")).toBeUndefined();
    });

    test("mergeCookies — 같은 이름이면 나중 값 승리", () => {
        expect(mergeCookies("a=1; b=2", "a=3")).toBe("a=3; b=2");
        expect(mergeCookies("", "; ;")).toBe("");
    });

});

describe("webform - SSO 세션 캐시", () => {
    test("재호출 시 sso-token·/sso 왕복 생략 (3요청 → 1요청)", async () => {
        const urls: string[] = [];
        const m = mockFetch((url) => {
            urls.push(url);
            if (url.includes("/api/app/sso-token")) return {body: `{"token":"jwt"}`};
            if (url.startsWith("https://arca.live/sso")) {
                return {status: 302, headers: {"set-cookie": "arca.at=abc; path=/"}};
            }
            // 페이지 — 폼(_csrf 포함) + 쿠키 회전
            return {body: `<input type="hidden" name="_csrf" value="x">`, headers: {"set-cookie": "arca.at=rot; path=/"}};
        });
        const http = new Http({fetch: m.fn});
        const p1 = await fetchWithSso(http, "/app-webview/reports/submit/article/1");
        expect(p1.cookie).toBe("arca.at=rot");
        const p2 = await fetchWithSso(http, "/app-webview/reports/submit/article/2");
        expect(p2.html).toContain("_csrf");
        // 1회차: sso-token + /sso + 페이지 / 2회차: 페이지만
        expect(urls.filter(u => u.includes("sso-token"))).toHaveLength(1);
        expect(urls.filter(u => u.startsWith("https://arca.live/sso?"))).toHaveLength(1);
        expect(urls.filter(u => u.includes("/app-webview/"))).toHaveLength(2);
    });

    test("세션 만료(폼 없음) 시 전체 재인증", async () => {
        let pageHits = 0;
        const m = mockFetch((url) => {
            if (url.includes("/api/app/sso-token")) return {body: `{"token":"jwt"}`};
            if (url.startsWith("https://arca.live/sso")) return {status: 302, headers: {"set-cookie": "arca.at=abc; path=/"}};
            pageHits++;
            // 2번째 페이지(캐시 세션 재사용)는 만료로 폼 없음 → 전체 재인증 후 정상 폼
            return pageHits === 2
                ? {body: "<html>login required</html>"}
                : {body: `<input type="hidden" name="_csrf" value="x">`};
        });
        const http = new Http({fetch: m.fn});
        await fetchWithSso(http, "/x");
        const p2 = await fetchWithSso(http, "/x");
        expect(p2.html).toContain("_csrf");
        expect(m.calls.filter(c => c.url.includes("sso-token"))).toHaveLength(2);
    });

    test("토큰 교체 시 캐시 세션 폐기 (이전 계정 세션 재사용 금지)", async () => {
        const m = mockFetch((url) => {
            if (url.includes("/api/app/sso-token")) return {body: `{"token":"jwt"}`};
            if (url.startsWith("https://arca.live/sso")) return {status: 302, headers: {"set-cookie": "arca.at=abc; path=/"}};
            return {body: `<input type="hidden" name="_csrf" value="x">`};
        });
        const http = new Http({token: "A", fetch: m.fn});
        await fetchWithSso(http, "/x");
        http.token = "B";
        await fetchWithSso(http, "/x");
        expect(m.calls.filter(c => c.url.includes("sso-token"))).toHaveLength(2);
    });

    test("sso-token API 에러는 재시도 없이 즉시 throw", async () => {
        const m = mockFetch(() => ({status: 401, body: `{"result":false,"message":"로그인 필요"}`}));
        const http = new Http({fetch: m.fn});
        await expect(fetchWithSso(http, "/x")).rejects.toBeInstanceOf(ArcaApiError);
        expect(m.calls).toHaveLength(1);
    });
});
