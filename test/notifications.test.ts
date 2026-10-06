import {describe, expect, test} from "bun:test";
import {ArcaApiError} from "../src";
import {arca} from "./live.ts";

describe("notifications - 알림 기능", () => {
    test("all - 전체 알림", async () => {
        try {
            const noti = await arca.notifications.all();
            expect(noti.notifications).toBeDefined();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403]).toContain(e.status);
            else throw e;
        }
    }, 15000);

    test("mention - 멘션 알림 (경로 오타 mentiond 원본 그대로)", async () => {
        try {
            const noti = await arca.notifications.mention();
            expect(noti.notifications).toBeDefined();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403]).toContain(e.status);
            else throw e;
        }
    }, 15000);

    test("comment - 댓글 알림", async () => {
        try {
            const noti = await arca.notifications.comment();
            expect(noti.notifications).toBeDefined();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403]).toContain(e.status);
            else throw e;
        }
    }, 15000);

    test("report - 신고 알림", async () => {
        try {
            const noti = await arca.notifications.report();
            expect(noti.notifications).toBeDefined();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403]).toContain(e.status);
            else throw e;
        }
    }, 15000);
});
