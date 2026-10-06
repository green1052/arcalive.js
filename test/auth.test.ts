import {describe, expect, test} from "bun:test";
import {ArcaApiError} from "../src";
import {arca} from "./live.ts";

describe("auth - 인증 기능", () => {
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
});
