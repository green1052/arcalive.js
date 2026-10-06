import type {Http} from "../internal/http.ts";
import {ArcaApiError} from "../errors.ts";
import {extractMessage, fetchWithSso, parseHiddenInputs, postWebForm} from "../internal/webform.ts";

/** 신고 대상 종류. */
export type ReportTarget = "article" | "comment";

/** 신고 제출 파라미터. */
export interface SubmitReportParams {
    /** 폼에서 파싱한 카테고리 코드 (form() 결과의 categories[].code). */
    categoryCode?: string;
    /** 카테고리 표기명 (예: "기타") — categoryCode 대신 지정 가능. */
    category?: string;
    /** 신고 사유. 필수, 최대 255자. */
    description: string;
    /** 폼의 token 히든 필드 (캡챠 필요 시). */
    recaptchaToken?: string;
}

/** GET /app-webview/reports/submit/{target}/{id} 파싱 결과. 카테고리 코드는 채널마다 다름. */
export interface ReportForm {
    target: ReportTarget;
    targetId: number;
    slug: string;
    reportType: string;
    categories: {code: string; label: string}[];
    /** hidden input 전체 (name → value). _csrf 포함. */
    hidden: Record<string, string>;
}

function parseForm(html: string, target: ReportTarget, targetId: number): ReportForm {
    const hidden = parseHiddenInputs(html);
    return {
        target,
        targetId,
        slug: hidden["slug"] ?? "",
        reportType: hidden["report_type"] ?? "local",
        categories: [...html.matchAll(/<option value="([0-9A-F]+)">([^<]+)<\/option>/g)]
            .map(m => ({code: m[1]!, label: m[2]!.trim()})),
        hidden,
    };
}

/**
 * 신고(여청) 제출 — 공앱이 WebView로 처리하는 `/app-webview/reports/submit` 플로우 재현.
 *
 * 공앱 시퀀스 (app-v2-85 분석):
 * 1. GET /api/app/sso-token → SSO JWT
 * 2. GET /sso?goto=/app-webview/reports/submit/{target}/{id}&token={sso} → 세션 쿠키(arca.at) 발급
 * 3. GET 폼 페이지 → _csrf/hidden 필드/카테고리 파싱 (카테고리는 채널별로 다름)
 * 4. POST /app-webview/reports/submit
 *
 * 주의: HTML 페이지 요청이라 Cloudflare 챌린지에 걸릴 수 있음 (fetch 계열은 간헐적 차단 관찰).
 * 실패 시 ArcaApiError — 409=이미 신고, 429=레이트리밋, 기타=폼 메시지 추출.
 */
export class ReportsApi {
    constructor(private http: Http) {}

    /** 신고 폼 조회/파싱. 카테고리 목록 확인용. */
    async form(target: ReportTarget, targetId: number): Promise<ReportForm> {
        const {html} = await this.fetchForm(target, targetId);
        return parseForm(html, target, targetId);
    }

    /** 신고 제출. 카테고리 미지정 시 첫 옵션 사용. */
    async submit(target: ReportTarget, targetId: number, params: SubmitReportParams): Promise<void> {
        if (params.description.length > 255) throw new Error("description은 최대 255자");
        const {html, cookie} = await this.fetchForm(target, targetId);
        const form = parseForm(html, target, targetId);

        const categoryCode = params.categoryCode
            ?? form.categories.find(c => c.label === params.category)?.code
            ?? form.categories[0]?.code;
        if (!categoryCode) throw new ArcaApiError(400, {result: false, message: "신고 카테고리를 찾을 수 없음"});

        const res = await postWebForm(this.http, "/app-webview/reports/submit", cookie, {
            _csrf: form.hidden["_csrf"] ?? "",
            token: params.recaptchaToken ?? "",
            report_target: target,
            target_id: targetId,
            slug: form.slug,
            report_type: form.reportType,
            category_code: categoryCode,
            description: params.description,
        });
        if (!(res.status >= 200 && res.status < 400)) {
            const msg = extractMessage(await res.text().catch(() => ""));
            throw new ArcaApiError(res.status, {result: false, message: msg});
        }
    }

    /** SSO 인증 후 신고 폼 페이지 확보. */
    private async fetchForm(target: ReportTarget, targetId: number): Promise<{html: string; cookie: string}> {
        const {html, cookie} = await fetchWithSso(this.http, `/app-webview/reports/submit/${target}/${targetId}`);
        if (!html.includes("article_write_form")) {
            const msg = extractMessage(html) ?? "신고 폼을 가져올 수 없음";
            throw new ArcaApiError(400, {result: false, message: msg});
        }
        return {html, cookie};
    }
}
