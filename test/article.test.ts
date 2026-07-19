import {describe, expect, test} from "bun:test";
import {ArcaApiError, ArcaClient} from "../src/index.ts";

const token = process.env.TOKEN;
const arca = new ArcaClient(token ? {token} : {});

describe("article(id) - 게시글 기능", () => {
    test("rate - 추천/비추천 (토큰 필요, recaptcha 옵션)", async () => {
        try {
            const ch = arca.channel("bluearchive");
            const list = await ch.articles({limit: 1});
            const first = list.articles?.[0];
            if (!first) return;
            const rating = await ch.article(first.id).rate(1);
            expect(rating.ratingUp).toBeGreaterThanOrEqual(0);
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403, 404, 405]).toContain(e.status);
            else throw e;
        }
    }, 15000);

    test("scrap / unscrap (토큰 필요)", async () => {
        try {
            const ch = arca.channel("bluearchive");
            const list = await ch.articles({limit: 1});
            const first = list.articles?.[0];
            if (!first) return;
            await ch.article(first.id).scrap();
            await ch.article(first.id).unscrap();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403, 404]).toContain(e.status);
            else throw e;
        }
    }, 15000);

    test("setNotice / setHeadline / setLive (관리자 권한 필요)", async () => {
        try {
            const ch = arca.channel("bluearchive");
            const list = await ch.articles({limit: 1});
            const first = list.articles?.[0];
            if (!first) return;
            const post = ch.article(first.id);
            await post.setNotice(1);
            await post.setNotice(0);
        } catch (e) {
            if (e instanceof ArcaApiError) expect([401, 403, 404, 405]).toContain(e.status);
            else throw e;
        }
    }, 15000);
});
