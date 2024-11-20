interface Article {
    block?: {
        id: number;
        expiresAt: string;
    };
    blockPreview: boolean;
    captcha: boolean;
    category: string;
    categoryDisplayName: string;
    channelPermission: {
        block: boolean;
        comment: boolean;
        controlArticle: boolean;
        deleteContents: boolean;
        editContents: boolean;
        multimedia: boolean;
        rate: boolean;
        setNotices: boolean;
        voiceComment: boolean;
        write: boolean;
    };
    commentCount: number;
    content: string;
    contentType: "html" | "text";
    createdAt: string;
    editor: string;
    gravatar: string;
    id: number;
    images: string[];
    isBest: boolean;
    isBestBlock: boolean;
    isDeletable: boolean;
    isEditable: boolean;
    isLive: boolean;
    isNotice: boolean;
    isReportable: boolean;
    isScraped: boolean;
    isSensitive: boolean;
    isSpoilerAlert: boolean;
    isUser: boolean;
    lastComment: string;
    liveConfig: {
        comboEmoticon: {
            enable: boolean;
            max: number;
        };
    };
    nickname: string;
    preventDelete: boolean;
    publicId: string | null;
    ratingDown: number;
    ratingDownIp: number;
    ratingUp: number;
    ratingUpIp: number;
    title: string;
    token: string;
    updatedAt: string;
    viewCount: number;
    // ?????
    vote: any[];
}

interface Comment {
    attachmentId: number | null;
    attachmentType?: "image" | "file" | "video" | "voicecomment";
    attachmentURL?: string;
    attachments?: {
        attachmentType: "image" | "file" | "video" | "voicecomment";
        id: number;
        url: string;
    }[];
    content: string;
    contentType: "text" | "emoticon";
    createdAt: string;
    depth: number;
    gravatar: string;
    id: number;
    image?: string;
    isDeletable: boolean;
    isEditable: boolean;
    isReportable: boolean;
    nickname: string;
    parentId: number;
    publicId: number | null;
    ratingDown: number;
    ratingUp: number;
    role: "admin" | "user";
    updatedAt: string;
}