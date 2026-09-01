import { sendEvent, type GtagParams } from "./gtag";

/**
 * 이벤트 택소노미 — 이 사이트가 GA4로 보내는 이벤트의 단일 소스.
 *
 * 규칙
 * 1. 이름은 snake_case, `<대상>_<동작>` 순서. GA4 추천 이벤트(login, sign_up …)는
 *    이름을 바꾸지 않고 그대로 쓴다. 리포트가 기본 제공되기 때문이다.
 * 2. 파라미터에 개인정보를 넣지 않는다. 이메일·닉네임·사용자 ID·글 본문은 금지.
 *    측정하려는 건 "무엇이 일어났는가"이지 "누가 했는가"가 아니다.
 *    (gtag.ts의 sanitizeParams가 런타임에서 한 번 더 막는다.)
 * 3. 새 이벤트는 반드시 여기 EventMap에 먼저 추가한다. track()이 타입으로 강제하므로
 *    택소노미에 없는 이름은 컴파일이 되지 않는다.
 * 4. 파라미터 이름은 도메인이 달라도 재사용한다(entry_point, surface, source …).
 *    GA4 맞춤 측정기준은 계정 단위로 갯수 제한이 있어서, 늘리는 것보다 겹쳐 쓰는 게 낫다.
 */

/** 파라미터가 없는 이벤트임을 나타낸다. */
type NoParams = Record<string, never>;

export type AuthMethod = "kakao" | "naver" | "google";
export type NavLocation = "header" | "bottom_tab" | "drawer";
export type NewsSource = "all" | "jumpball" | "rookie";
export type ContentSurface = "home" | "news_page";

export interface EventMap {
	// ── 인증 ─────────────────────────────────────────────
	/**
	 * 소셜 로그인 버튼을 눌러 외부 인증으로 나가는 시점.
	 * 성공 여부는 프로바이더로 리다이렉트된 뒤라 여기서 알 수 없다. 시작만 센다.
	 */
	login_start: { method: AuthMethod };
	logout: NoParams;

	// ── 내비게이션 ───────────────────────────────────────
	nav_click: { nav_item: string; nav_location: NavLocation };

	// ── 스케줄 · 경기 ────────────────────────────────────
	schedule_season_change: { season: string };
	schedule_view_change: { view: "list" | "calendar" };
	game_detail_open: {
		game_id: string;
		entry_point: "next_game" | "list" | "calendar";
	};

	// ── 뉴스 ─────────────────────────────────────────────
	news_source_filter: { source: NewsSource };
	news_load_more: { page: number };
	/** 외부 기사로 이탈하는 지점. 어느 화면에서 나갔는지가 핵심이다. */
	news_article_open: { source: string; surface: ContentSurface };

	// ── 직관 일기 ────────────────────────────────────────
	diary_submit: { mode: "create" | "edit"; photo_count: number; has_game: boolean };

	// ── 방명록 ───────────────────────────────────────────
	guestbook_submit: { has_photo: boolean };

	// ── 아케이드 ─────────────────────────────────────────
	arcade_start: NoParams;
	arcade_exit: NoParams;
}

export type EventName = keyof EventMap;

/** 파라미터 없는 이벤트는 track("logout") 처럼 인자 없이 부르게 한다. */
type TrackArgs<K extends EventName> = EventMap[K] extends NoParams
	? []
	: [params: EventMap[K]];

/**
 * 택소노미에 등록된 이벤트만 보낼 수 있다.
 *
 *   track("nav_click", { nav_item: "뉴스", nav_location: "header" });
 *   track("logout");
 */
export function track<K extends EventName>(name: K, ...args: TrackArgs<K>): void {
	sendEvent(name, (args[0] ?? {}) as GtagParams);
}

/** 택소노미 전체 이름 목록. 문서화·테스트용. */
export const EVENT_NAMES = [
	"login_start",
	"logout",
	"nav_click",
	"schedule_season_change",
	"schedule_view_change",
	"game_detail_open",
	"news_source_filter",
	"news_load_more",
	"news_article_open",
	"diary_submit",
	"guestbook_submit",
	"arcade_start",
	"arcade_exit",
] as const satisfies readonly EventName[];
