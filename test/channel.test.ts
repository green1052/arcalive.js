import {describe, expect, test} from "bun:test";
import {ArcaApiError, ArcaClient} from "../src/index.ts";

const token = process.env.TOKEN;
const arca = new ArcaClient(token ? {token} : {});

describe("channel(slug) - 채널 기능", () => {
    test("articles - b 채널 게시글 목록", async () => {
        try {
            const ch = arca.channel("bluearchive");
            const res = await ch.articles({limit: 5});
            expect(res.articles).toBeDefined();
        } catch (e) {
            if (e instanceof ArcaApiError) expect(e.status).toBe(403);
            else throw e;
        }
    }, 15000);

    test("article(id).view - 게시글 상세조회", async () => {
        try {
            const ch = arca.channel("bluearchive");
            const list = await ch.articles({limit: 1});
            const first = list.articles?.[0];
            if (!first) return;
            const article = await ch.article(first.id).view();
            expect(article.title).toBeTruthy();
            expect(article.ratingUp).toBeGreaterThanOrEqual(0);
        } catch (e) {
            if (e instanceof ArcaApiError) expect(e.status).toBe(403);
            else throw e;
        }
    }, 15000);

    test("notice - 채널 공지", async () => {
        try {
            const ch = arca.channel("bluearchive");
            const res = await ch.notice();
            expect(res.articles).toBeDefined();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([403, 404]).toContain(e.status);
            else throw e;
        }
    }, 15000);
});
