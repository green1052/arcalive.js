import {describe, expect, test} from "bun:test";
import {ArcaApiError, ArcaClient} from "../src/index.ts";

const token = process.env.TOKEN;
const arca = new ArcaClient(token ? {token} : {});

describe("channels (인증 불필요)", () => {
    test("list - 채널 목록 조회", async () => {
        const channels = await arca.channels.list();
        expect(channels.length).toBeGreaterThan(0);
        expect(channels[0]?.slug).toBeTruthy();
    }, 15000);

    test("main - 메인 채널 조회", async () => {
        try {
            const main = await arca.channels.main();
            expect(main.length).toBeGreaterThan(0);
            expect(main[0]?.name).toBeTruthy();
        } catch (e) {
            if (e instanceof ArcaApiError) expect([403, 429, 500]).toContain(e.status);
            else throw e;
        }
    }, 15000);
});
