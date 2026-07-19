import type {ExceptionResponse} from "./types.ts";

export class ArcaApiError extends Error {
    readonly status: number;
    readonly response: ExceptionResponse | null;

    constructor(status: number, response: ExceptionResponse | null, message?: string) {
        super(message ?? response?.message ?? `arca.live API error ${status}`);
        this.name = "ArcaApiError";
        this.status = status;
        this.response = response;
    }
}