// Content builder for arca.live article posting.
// Mirrors ArticleElementTypeConverter.fromModel — 직렬화 포맷은 kotlinx.serialization @Serializable 기준.

export type ContentPart =
    | { type: "text"; text: string }
    | { type: "html"; tag: string; html: string }
    | { type: "media"; url: string; tag: string; width?: number; height?: number }
    | { type: "videoLink"; title?: string; description?: string; imageUrl?: string; html?: string }
    | { type: "emoticon"; emoticonUrl: string }
    | { type: "emoticons"; emoticonUrls: string[] }

function uuid(): string {
    return crypto.randomUUID();
}

function serialize(part: ContentPart): string {
    switch (part.type) {
        case "text":
            // TextArticleElement — showPlaceholder/focused=false 생략, text는 TextFieldValueSerializer가 문자열만 인코딩
            return JSON.stringify({text: part.text, uuid: uuid()});
        case "html":
            // HtmlArticleElement
            return JSON.stringify({tag: part.tag, html: part.html, uuid: uuid()});
        case "media": {
            // RemoteMediaArticleElement — width/height=0이면 생략
            const o: Record<string, unknown> = {url: part.url, tag: part.tag};
            if (part.width) o.width = part.width;
            if (part.height) o.height = part.height;
            o.uuid = uuid();
            return JSON.stringify(o);
        }
        case "videoLink":
            // VideoLinkArticleElement — 전부 nullable, 전부 인코딩
            return JSON.stringify({
                title: part.title ?? null,
                description: part.description ?? null,
                imageUrl: part.imageUrl ?? null,
                html: part.html ?? null,
                uuid: uuid()
            });
        case "emoticon":
            // EmoticonArticleElement
            return JSON.stringify({emoticonUrl: part.emoticonUrl, uuid: uuid()});
        case "emoticons":
            // EmoticonsArticleElement
            return JSON.stringify({emoticonUrls: part.emoticonUrls, uuid: uuid()});
    }
}

/**
 * ContentPart[] → arca.live content 문자열(JSON 배열).
 * `[{"key":"text","value":"<직렬화된 요소>"},...]` 포맷.
 * ArticleElementTypeConverter.fromModel과 동일.
 */
export function buildContent(parts: ContentPart[]): string {
    return JSON.stringify(parts.map((p) => ({key: p.type, value: serialize(p)})));
}

/** 단순 텍스트 → content 문자열. text 요소 하나로 감쌈. */
export function textContent(text: string): string {
    return buildContent([{type: "text", text}]);
}