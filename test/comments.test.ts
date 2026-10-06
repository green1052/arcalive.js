import {describe, expect, test} from "bun:test";
import {ArcaApiError} from "../src";
import {arca, slug} from "./live.ts";

describe.skipIf(!slug)("comments - 댓글 기능", () => {
    test("list - 댓글 목록", async () => {
        try {
            const ch = arca.channel(slug);
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
});
