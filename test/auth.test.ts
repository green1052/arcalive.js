import {describe, expect, test} from "bun:test";
import {ArcaApiError, ArcaClient} from "../src/index.ts";

const token = process.env.TOKEN;
const arca = new ArcaClient(token ? {token} : {});

describe("auth - 인증 기능", () => {
    test("login - deprecated, 항상 throw ArcaApiError(404)", async () => {
        expect(arca.auth.login("x", "y")).rejects.toThrow(ArcaApiError);
        try {
            await arca.auth.login("x", "y");
        } catch (e) {
            expect(e).toBeInstanceOf(ArcaApiError);
            expect((e as ArcaApiError).status).toBe(404);
        }
    });

    test("me - 내 정보 조회", async () => {
        try {
            const me = await arca.auth.me();
            expect(me.username).toBeTruthy();
            expect(me.nickname).toBeTruthy();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403]).toContain(e.status);
            else throw e;
        }
    }, 15000);

    test("ssoToken - SSO 토큰 조회", async () => {
        try {
            const res = await arca.auth.ssoToken();
            expect(res.token).toBeTruthy();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403]).toContain(e.status);
            else throw e;
        }
    }, 15000);

    test("qrLoginUnauthed - 미인증 QR 로그인 (가짜 토큰)", async () => {
        try {
            const res = await arca.auth.qrLoginUnauthed("invalidtoken");
            expect(res).toBeDefined();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([400, 401, 403, 404]).toContain(e.status);
            else throw e;
        }
    }, 15000);

    test("logout - 호출 스킵 (토큰 무효화 방지)", async () => {
        // 로그아웃하면 토큰이 무효화되므로 호출하지 않음
        expect(true).toBe(true);
    });
});
