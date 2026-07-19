// DTO types for arca.live unofficial API client.
// Derived from app-v2-85.apk static analysis (see arca.live/docs/API.md).

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

export interface Block {
    id?: number;
    expiresAt?: string | null;
    description?: string | null;
    expired?: string | null;
}

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

export interface Placeholder {
    article?: string | null;
    comment?: string | null;
    category?: Record<string, unknown> | null;
}

export interface CurrencyEntity {
    currency: number;
}

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
    rateValue?: number | null;
    isRelay?: boolean | null;
    liveConfig?: unknown | null;
    disableNotification?: boolean | null;
}

export interface ArticlesResponse {
    articles?: Article[] | null;
    next?: Record<string, string> | null;
}

export interface Rating {
    id: number;
    ratingUp: number;
    ratingDown: number;
    ratingUpIp: number;
    ratingDownIp: number;
}

export interface Result {
    id?: number | null;
    result?: boolean | null;
}

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

export interface NotificationBundle {
    notifications: Notification[];
}

export interface ExceptionResponse {
    message?: string | null;
    result?: boolean | null;
    blocked?: Block | null;
}

export interface UploadResponse {
    idx?: number | null;
    url?: string | null;
}

export interface EmoticonIdBundle {
    emoticonId?: number | null;
}

// Query params for channel articles listing.
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

export interface ScrapListQuery {
    p?: number;
    keyword?: string;

    [key: string]: string | number | undefined;
}

export interface CommentsListQuery {
    since?: number
    limit?: number

    [key: string]: string | number | undefined
}

export interface ArticlePostingMetadata {
    slug: string
    articleId: number
}