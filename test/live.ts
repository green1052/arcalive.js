/** 라이브 테스트 공용 설정 — 읽기 전용 호출만 (쓰기/신고/추천 등 부작용 있는 API는 테스트하지 않음). */
import {ArcaClient} from "../src";

export const token = process.env.TOKEN;
/** 대상 채널 slug (.env CHANNEL). 없으면 채널 테스트 스킵. */
export const slug = process.env.CHANNEL ?? "";
export const arca = new ArcaClient(token ? {token} : {});
