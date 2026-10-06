# arcalive.js

[arca.live](https://arca.live) 비공식 API 클라이언트 — 공식 Android 앱(v2.85) 프로토콜을 역분석해 재현한 TypeScript 라이브러리.

## 설치

```bash
bun add @green-1052/arcalive.js
# 또는 npm i @green-1052/arcalive.js
```

런타임: Bun / Node.js 22+ (ky 2 요구사항). 의존성: ky.

## 토큰

모든 쓰기 기능에는 로그인 토큰이 필요합니다. 공앱 SharedPreferences의 `PREFS_LAST_USER_TOKEN` 값을 사용하세요.

```ts
const arca = new ArcaClient({token: "..."});
```

## 사용법

### 조회

```ts
import {ArcaClient} from "@green-1052/arcalive.js";

const arca = new ArcaClient();

// 채널 목록
const channels = await arca.channels.list();

// 게시글 목록 + 커서 자동 순회
for await (const a of arca.channel("bluearchive").articlePages({limit: 30})) {
    console.log(a.id, a.title, a.commentCount);
}

// 게시글/댓글 조회
const article = await arca.channel("bluearchive").article(12345).view();
const comments = await arca.channel("bluearchive").article(12345).comments().list();

// 알림 / 이모티콘 / 내 정보
await arca.notifications.all();
await arca.emoticons.list();
await arca.auth.me(); // 토큰 필요
```

### 작성 (토큰 필요)

```ts
const ch = arca.channel("b");

// 글쓰기 — 본문은 HTML 문자열 (공앱 WebView 웹 폼 플로우 재현)
const {articleId} = await ch.postArticle({
    title: "제목",
    content: "<p>본문</p>",
});

// 댓글 / 대댓글 / 아카콘
const comments = ch.article(articleId).comments();
const c = await comments.create({content: "댓글"});
await comments.create({content: "대댓글", parentId: c.id});
await comments.createEmoticon(setId, itemId); // 아카콘 (세트/아이템 id 주의)

// 수정 / 삭제 (로그인 계정은 빈 비밀번호)
await comments.edit(c.id, {content: "수정"});
await comments.delete(c.id);
await ch.article(articleId).editArticle({title: "수정", contentType: "html", content: "<p>x</p>"});
await ch.article(articleId).deleteArticle();
```

### 신고 (여청)

공앱이 WebView로 처리하는 `/app-webview/reports/submit` 플로우를 재현합니다.

```ts
// 카테고리는 채널마다 다름 — 폼에서 조회
const form = await arca.reports.form("article", articleId);
console.log(form.categories); // [{code, label}, ...]

await arca.reports.submit("article", articleId, {
    category: "기타",
    description: "신고 사유 (최대 255자)",
});
```

## 제약

- **추천/비추천** (`rate`): 유효한 reCAPTCHA 토큰 필요 — 헤드리스로는 불가 (405 응답 실측).
- **Cloudflare**: 신고/글쓰기 등 HTML 페이지 요청(웹 폼 플로우)은 fetch 계열 TLS 지문이 간헐적으로 챌린지에 걸립니다. 세션 쿠키를 캐시해 재요청을 최소화하지만, 차단 시 브라우저 유사 fetch를 주입하세요:
  ```ts
  new ArcaClient({fetch: curlImpersonateFetch}); // (input, init) => Promise<Response>
  ```
- **아카콘 댓글**: 계정에 이모티콘 권한이 필요합니다 (권한 없으면 403).
- **에러/재시도**: API 실패는 `ArcaApiError`(`status`, `response`)로 throw되며 자동 재시도는 없습니다. 기본 타임아웃은 10초 — 큰 파일 업로드는 `new ArcaClient({timeout: 60_000})`처럼 늘리세요.

## API 영역

| 영역 | 진입점 | 기능 |
|---|---|---|
| auth | `arca.auth` | me, ssoToken, qrLogin, logout, push 등록 |
| channels | `arca.channels` / `arca.channel(slug)` | 채널 목록/정보, 게시글 목록·순회, 구독, 차단 |
| article | `channel.article(id)` | 조회, 수정, 삭제, 스크랩, 공지/헤드라인 |
| comments | `article.comments()` | 목록, 작성(텍스트/대댓글/아카콘), 수정, 삭제 |
| reports | `arca.reports` | 신고 폼 조회, 제출 |
| notifications | `arca.notifications` | 전체/멘션/댓글/신고 알림, 읽음 처리 |
| emoticons | `arca.emoticons` | 세트/항목 조회 |
| users | `arca.users` | 최근 활동 |
| misc | `arca.misc` | 버전, 공지, 뉴스, 투표, 업로드 |

## 개발

```bash
bun install
bun run typecheck   # tsc --noEmit
bun test            # 오프라인 단위 + 라이브(읽기 전용) 테스트. .env: TOKEN, CHANNEL(대상 채널 slug, 없으면 채널 테스트 스킵)
bun run build
```

## 라이선스

GPL-3.0-only
