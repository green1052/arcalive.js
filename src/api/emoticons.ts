import type {Http} from "../internal/http.ts";
import type {Emoticon, EmoticonIdBundle, EmoticonSet} from "../types.ts";

export class EmoticonsApi {
    constructor(private http: Http) {}

    /** GET /api/app/list/emoticon — 이모티콘 세트 목록. */
    list(): Promise<EmoticonSet[]> {
        return this.http.api.get("/api/app/list/emoticon").json<EmoticonSet[]>();
    }

    /** GET /api/app/list/emoticon/{emoticonSetId} — 세트 내 이모티콘. */
    items(emoticonSetId: number): Promise<Emoticon[]> {
        return this.http.api.get(`/api/app/list/emoticon/${emoticonSetId}`).json<Emoticon[]>();
    }

    /** GET /api/app/find/emoticon/{attachmentId} — 첨부파일을 이모티콘으로 등록/조회. */
    find(attachmentId: number): Promise<EmoticonIdBundle> {
        return this.http.api.get(`/api/app/find/emoticon/${attachmentId}`).json<EmoticonIdBundle>();
    }
}
