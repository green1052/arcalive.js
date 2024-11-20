interface ChannelInfo {
    captcha: boolean;
    channel: {
        adTags: number;
        categories: string[];
        categoryData: {
            displayName: string;
            id: string;
            hiddenPreview?: boolean;
        }[];
        description: string;
        isMeta: boolean;
        modes: {
            id: string;
            name: string;
        }[];
        name: string;
        requireCategory: boolean;
        slug: string;
        subscribes: number;
    };
    contentType: string;
    iconURL: string;
    notificated: boolean;
    permission: {
        audit: boolean;
        block: boolean;
        channelInfo: boolean;
        comment: boolean;
        controlArticle: boolean;
        deleteContents: boolean;
        editContents: boolean;
        multimedia: boolean;
        rate: boolean;
        reportAccesible: boolean;
        setNotices: boolean;
        write: boolean;
    };
    placeholder: {
        article: string;
        category: {
            [key: string]: {
                article: string;
                comment: string;
            };
        };
    };
    comment: string;
    report: string;
    subscribed: boolean;
    wiki: boolean;
}

interface ArticleInfo {
    category: string;
    categoryDisplayName: string;
    commentCount: number;
    createdAt: string;
    id: number;
    isSpoilerAlert: boolean;
    isUser: boolean;
    mark: "best" | "image" | null;
    nickname: string;
    publicId: number | null;
    ratingDown: number;
    ratingUp: number;
    thumbnailUrl: string | null;
    title: string;
    viewCount: number;
    ip?: string;
};

interface Articles {
    articles: ArticleInfo[];
    next?: {
        before: string;
        offset: string;
    }
};
