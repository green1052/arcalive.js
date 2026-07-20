import type {ExceptionResponse} from "./types.ts";

/**
 * arca.live API 요청 실패 시 throw되는 에러.
 * ky의 HTTPError를 잡아 {@link ExceptionResponse} 본문과 함께 래핑.
 */
export class ArcaApiError extends Error {
    /** HTTP 상태 코드. */
    readonly status: number;
    /** 파싱된 에러 응답 본문. 본문이 없거나 JSON이 아니면 null. */
    readonly response: ExceptionResponse | null;

    constructor(status: number, response: ExceptionResponse | null, message?: string) {
        super(message ?? response?.message ?? `arca.live API error ${status}`);
        this.name = "ArcaApiError";
        this.status = status;
        this.response = response;
    }
}
