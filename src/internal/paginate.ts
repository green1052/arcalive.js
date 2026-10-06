/**
 * 커서 기반 목록 순회 헬퍼 — async generator.
 * `next` 파라미터를 원본 쿼리에 병합해 끝까지 자동 fetch하며 item 단위로 yield.
 * 0.5.x fetch-extras 구현과 동일 시맨틱: 매 페이지 원본 쿼리 위에 커서만 얹음.
 */
import type {Http} from "./http.ts";

/** (json) → items + 다음 페이지 쿼리 파라미터. next가 비어있으면 순회 종료. */
export type PageParser<T> = (json: unknown) => {items: T[]; next?: Record<string, string>};

export async function* paginateItems<T>(
    http: Http,
    path: string,
    query: Record<string, string | number | boolean | undefined> | undefined,
    parse: PageParser<T>
): AsyncGenerator<T> {
    let cursor: Record<string, string> | undefined;
    for (;;) {
        const {items, next} = parse(await http.api.get(path, {searchParams: {...query, ...cursor}}).json());
        yield* items;
        if (!next || Object.keys(next).length === 0) return;
        cursor = next;
    }
}
