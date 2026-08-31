/**
 * 치비 일러스트 자산.
 *
 * 원본(public/images/*.PNG)은 여백·리그/구단 로고·작가 워터마크가 함께 들어 있고
 * 장당 0.4~1.7MB라 그대로 쓰지 않는다. scripts/crop-chibi.mjs로 배경을 투명화하고
 * 가장 큰 연결 요소(캐릭터)만 남겨 크롭한 WebP를 여기서 참조한다.
 *
 * 새 원본을 추가하면:
 *   node scripts/crop-chibi.mjs <파일명.PNG>
 */
export const CHIBI = {
	/** 홈 유니폼(레드), 정면 미소 — 기본 빈 상태 */
	red: "/images/chibi/soheered.webp",
	/** 어웨이 유니폼(블랙), 정면 미소 */
	black: "/images/chibi/soheeblack.webp",
	/** 화이트 유니폼, 정면 미소 */
	white: "/images/chibi/soheewhite.webp",
	/** 레드 유니폼, 결연한 표정 — 브랜드/프로필용 */
	no6: "/images/chibi/no6.webp",
	/** 슛 동작 (화이트) — 로딩 */
	shotWhite: "/images/chibi/shot1.webp",
	/** 슛 동작 (블랙, 공 포함) */
	shotBlack: "/images/chibi/shot2.webp",
	/** 눈물 — 에러 상태 */
	tears: "/images/chibi/winner1.webp",
	/** 눈물 (다른 포즈) */
	tears2: "/images/chibi/winner2.webp",
} as const;

export type ChibiKey = keyof typeof CHIBI;
