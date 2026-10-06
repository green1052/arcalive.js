import type {ExceptionResponse} from "./types.ts";

/**
 * arca.live API 요청 실패 시 throw되는 에러.
 * HTTP !ok 응답을 {@link ExceptionResponse} 본문(JSON 파싱 실패 시 null)과 함께 래핑.
 * 웹 폼 플로우는 HTML 에러 페이지의 메시지를 추출해 주입한다.
 */
export class ArcaApiError extends Error {
    /** HTTP 상태 코드. */
    readonly status: number;
    /** 파싱된 에러 응답 본문. 본문이 없거나 JSON이 아니면 null. */
    readonly response: ExceptionResponse | null;

    constructor(status: number, response: ExceptionResponse | null) {
        super(response?.message ?? `arca.live API error ${status}`);
        this.name = "ArcaApiError";
        this.status = status;
        this.response = response;
    }
}
