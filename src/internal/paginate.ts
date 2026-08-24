import {paginate} from "fetch-extras";
import type {Http} from "./http.ts";

/** (json) → items + 다음 페이지 쿼리 파라미터. next 비어있으면 순회 종료. */
export type PageParser<T> = (json: unknown) => {items: T[]; next?: Record<string, string>};

/**
 * 커서 기반 목록 순회 공용 헬퍼.
 * next 파라미터를 기준 URL에 병합해 끝까지 fetch. item 단위로 yield.
 */
export function paginateItems<T>(
    http: Http,
    path: string,
    query: Record<string, string | number | boolean | undefined> | undefined,
    parse: PageParser<T>
): AsyncIterableIterator<T> {
    const baseUrl = new URL(path, http.baseUrl);
    if (query) for (const [k, v] of Object.entries(query)) if (v !== undefined) baseUrl.searchParams.set(k, String(v));
    let cursor: Record<string, string> | undefined;
    return paginate<T>(baseUrl, {
        fetchFunction: http.ky,
        pagination: {
            transform: async (response) => {
                const {items, next} = parse(await response.json());
                cursor = next && Object.keys(next).length > 0 ? next : undefined;
                return items;
            },
            paginate: () => {
                if (!cursor) return false;
                const nextUrl = new URL(baseUrl);
                for (const [k, v] of Object.entries(cursor)) nextUrl.searchParams.set(k, v);
                return {url: nextUrl};
            },
        },
    });
}
