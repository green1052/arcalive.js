/**
 * DTO types for arca.live unofficial API client.
 * Derived from app-v2-85.apk static analysis (see arca.live/docs/API.md).
 */

export type ChannelSlug = string
export type ArticleId = number
export type CommentId = number

export interface AuthUser {
    username: string;
    nickname: string;
    publicId?: number | null;
    point: number;
    token: string;
    profile_image?: string | null;
}

export interface User {
    username: string;
    nickname: string;
    publicId?: number | null;
    point?: number | null;
    token?: string | null;
    profile_image: string;
}

/** 사용자 차단(블록) 상태. */
export interface Block {
    id?: number;
    expiresAt?: string | null;
    description?: string | null;
    expired?: string | null;
}

/** 채널 권한 비트 — 게시/댓글/관리 등. */
export interface ChannelPermission {
    write?: boolean | null;
    comment?: boolean | null;
    block?: boolean | null;
    audit?: boolean | null;
    setNotices?: boolean | null;
    controlArticle?: boolean | null;
    deleteContents?: boolean | null;
    voiceComment?: boolean | null;
    channelInfo?: boolean | null;
    reportAccesible?: boolean | null;
}

export interface Channel {
    name: string;
    slug: string;
    description?: string | null;
    categories?: string[] | null;
    adTags?: number;
    subscribes?: number | null;
    modes?: unknown[] | null;
    contentType?: string | null;
    requireCategory?: boolean | null;
}

export interface ChannelMeta {
    slug: string;
    name: string;
    iconURL?: string | null;
    articleImage?: string | null;
    description?: string | null;
    subscribes?: number | null;
    notificates?: number | null;
}

/** 채널별 입력 placeholder 텍스트. */
export interface Placeholder {
    article?: string | null;
    comment?: string | null;
    category?: Record<string, unknown> | null;
}

/** 통화 단위. */
export interface CurrencyEntity {
    currency: number;
}

/** 환율 테이블. */
export interface ExchangeEntity {
    USD?: CurrencyEntity;
    "100JPY"?: CurrencyEntity;
    EUR?: CurrencyEntity;
}

export interface ChannelResponse {
    channel: Channel;
    permission: ChannelPermission;
    subscribed?: boolean | null;
    captcha?: boolean | null;
    wiki?: boolean | null;
    placeholder?: Placeholder | null;
    iconURL?: string | null;
    currency?: ExchangeEntity | null;
}

/** 댓글 첨부(이미지/음성 등). */
export interface CommentAttachment {
    id: number;
    url: string;
    attachmentType: string;
}

export interface Comment {
    id: number;
    nickname?: string | null;
    publicId?: number | null;
    createdAt?: string | null;
    contentType?: string | null;
    content?: string | null;
    gravatar?: string | null;
    ip?: string | null;
    depth?: number | null;
    block?: Block | null;
    role?: string | null;
    isReportable?: boolean | null;
    parentId?: number | null;
    attachmentURL?: string | null;
    attachments?: CommentAttachment[] | null;
    deleted?: boolean | null;
    disableNotification?: boolean | null;
}

export interface Article {
    id: number;
    nickname?: string | null;
    publicId?: number | null;
    title: string;
    category?: string | null;
    categoryDisplayName?: string | null;
    token?: string | null;
    viewCount?: number | null;
    commentCount: number;
    createdAt?: string | null;
    ratingUp: number;
    ratingDown: number;
    ratingUpIp: number;
    ratingDownIp: number;
    ip?: string | null;
    content?: string | null;
    boardSlug?: string | null;
    boardName?: string | null;
    isSensitive?: boolean | null;
    isEditable?: boolean | null;
    isReportable?: boolean | null;
    gravatar?: string | null;
    preventDelete?: boolean | null;
    comment?: Comment | null;
    markValue?: string | null;
    roleValue?: string | null;
    captcha?: boolean | null;
    thumbnailUrl?: string | null;
    channelPermission?: ChannelPermission | null;
    block?: Block | null;
    isBest?: boolean | null;
    isScraped?: boolean | null;
    isNotice?: boolean | null;
    isBestBlock?: boolean | null;
    isLive?: boolean | null;
    vote?: unknown[] | null;
    editor?: string | null;
    notice?: unknown | null;
    deal?: unknown | null;
    blockPreview?: boolean | null;
    isSpoilerAlert?: boolean | null;
    isUser?: boolean | null;
    mark?: "image" | "best" | string | null;
    rateValue?: number | null;
    isRelay?: boolean | null;
    liveConfig?: unknown | null;
    disableNotification?: boolean | null;
}

/** 게시글 목록 응답. next는 페이지네이션 커서(before/offset). */
export interface ArticlesResponse {
    articles?: Article[] | null;
    next?: {
        before: string;
        offset: string;
    };
}

/** 평가(추천/비추천) 카운트. */
export interface Rating {
    id: number;
    ratingUp: number;
    ratingDown: number;
    ratingUpIp: number;
    ratingDownIp: number;
}

/** 범용 결과 응답 — result(성공 여부) 또는 id. */
export interface Result {
    id?: number | null;
    result?: boolean | null;
}

/** 단일 토큰 응답. */
export interface TokenBundle {
    token: string;
}

export interface NotificationBoard {
    name: string;
    slug: string;
}

export interface NotificationArticleRef {
    id: number;
    title: string;
}

export interface NotificationCommentRef {
    id: number;
    content: string;
    content_type: string;
}

export interface Notification {
    token?: string | null;
    is_read: boolean;
    created_at: number;
    icon_url?: string | null;
    attachment_url?: string | null;
    type?: string | null;
    title?: string | null;
    content?: string | null;
    username?: string | null;
    link?: string | null;
    board?: NotificationBoard | null;
    article?: NotificationArticleRef | null;
    comment?: NotificationCommentRef | null;
}

/** 알림 목록 응답. */
export interface NotificationBundle {
    notifications: Notification[];
}

/** 에러 응답 본문. */
export interface ExceptionResponse {
    message?: string | null;
    result?: boolean | null;
    blocked?: Block | null;
}

/** 업로드 결과 — idx와 url. */
export interface UploadResponse {
    idx?: number | null;
    url?: string | null;
}

/** 이모티콘 id 응답. */
export interface EmoticonIdBundle {
    emoticonId?: number | null;
}

/** 채널 게시글 목록 쿼리 파라미터. */
export interface ChannelArticlesQuery {
    mode?: string;
    sort?: string;
    cut?: number;
    category?: string;
    limit?: number;
    target?: string;
    keyword?: string;

    [key: string]: string | number | boolean | undefined;
}

/** 스크랩 목록 쿼리 파라미터. */
export interface ScrapListQuery {
    p?: number;
    keyword?: string;

    [key: string]: string | number | undefined;
}

/** 댓글 목록 쿼리 파라미터. */
export interface CommentsListQuery {
    since?: number;
    limit?: number;

    [key: string]: string | number | undefined;
}

/** 게시글 작성 결과 — 생성된 게시글의 slug와 id. */
export interface ArticlePostingMetadata {
    slug: string;
    articleId: number;
}
