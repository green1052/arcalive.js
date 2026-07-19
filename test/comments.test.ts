import {describe, expect, test} from "bun:test";
import {ArcaApiError, ArcaClient} from "../src";

const token = process.env.TOKEN;
const arca = new ArcaClient(token ? {token} : {});

describe("comments - 댓글 기능", () => {
    test("list - 댓글 목록", async () => {
        try {
            const ch = arca.channel("bluearchive");
            const list = await ch.articles({limit: 1});
            const first = list.articles?.[0];
            if (!first) return;
            const comments = await ch.article(first.id).comments().list({limit: 10});
            expect(Array.isArray(comments)).toBe(true);
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403, 404]).toContain(e.status);
            else throw e;
        }
    }, 15000);

    test("create + item(id).edit (토큰 필요, 실제 쓰기)", async () => {
        if (!token) return; // 쓰기 테스트는 토큰 있을 때만
        try {
            const ch = arca.channel("bluearchive");
            const list = await ch.articles({limit: 1});
            const first = list.articles?.[0];
            if (!first) return;
            const comments = ch.article(first.id).comments();
            const created = await comments.create({content: "test 댓글 (자동화)"});
            if (created.id) {
                await comments.item(created.id).edit({content: "test 댓글 수정"});
            }
        } catch (e) {
            if (e instanceof ArcaApiError) expect([400, 401, 403, 404]).toContain(e.status);
            else throw e;
        }
    }, 15000);
});
