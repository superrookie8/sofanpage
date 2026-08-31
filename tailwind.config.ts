import type { Config } from "tailwindcss";

/** CSS 변수(공백 구분 RGB 채널)를 Tailwind 색상으로 감싼다. */
const withOpacity = (variable: string) =>
	`rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
	content: [
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/features/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		// 표준 min-width 캐스케이드. (구 설정은 sm=max-500 배타 구간이었다)
		screens: {
			sm: "480px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
		},
		extend: {
			// 실제 색값은 src/app/globals.css의 :root 팔레트 한 곳에서 정의한다.
			// 여기서는 그 변수를 참조만 하므로, 리브랜딩 시 이 파일은 건드릴 필요가 없다.
			// rgb(... / <alpha-value>) 형태라 bg-brand-500/40 같은 투명도 유틸도 동작한다.
			colors: {
				brand: {
					50: withOpacity("--brand-50"),
					100: withOpacity("--brand-100"),
					200: withOpacity("--brand-200"),
					400: withOpacity("--brand-400"),
					500: withOpacity("--brand-500"),
					600: withOpacity("--brand-600"),
					700: withOpacity("--brand-700"),
				},
				ink: {
					50: withOpacity("--ink-50"),
					100: withOpacity("--ink-100"),
					200: withOpacity("--ink-200"),
					300: withOpacity("--ink-300"),
					500: withOpacity("--ink-500"),
					700: withOpacity("--ink-700"),
					900: withOpacity("--ink-900"),
				},
				// ink-900 배경 위에 얹는 다크 카드 서피스
				surface: {
					dark: withOpacity("--surface-dark"),
				},
				win: withOpacity("--win"),
				lose: withOpacity("--lose"),
				info: withOpacity("--info"),
				warn: withOpacity("--warn"),
				medal: {
					gold: withOpacity("--medal-gold"),
					silver: withOpacity("--medal-silver"),
					bronze: withOpacity("--medal-bronze"),
				},
				// 외부 서비스 고유색이라 리브랜딩 대상이 아니다. 변수화하지 않는다.
				kakao: "#FEE500",
				naver: "#03C75A",

				// 리디자인 이전 화면들이 아직 기본 red-* 를 쓴다.
				// 이 프로젝트에서 red는 곧 브랜드색이므로 팔레트를 브랜드로 덮어
				// 남은 화면들도 리브랜딩에 함께 따라오게 한다.
				// (브랜드 램프에 없는 단계는 가장 가까운 값으로 매핑)
				red: {
					50: withOpacity("--brand-50"),
					100: withOpacity("--brand-100"),
					200: withOpacity("--brand-200"),
					300: withOpacity("--brand-200"),
					400: withOpacity("--brand-400"),
					500: withOpacity("--brand-500"),
					600: withOpacity("--brand-600"),
					700: withOpacity("--brand-700"),
					800: withOpacity("--brand-700"),
					900: withOpacity("--brand-700"),
					950: withOpacity("--brand-700"),
				},
			},
			fontFamily: {
				sans: [
					"Pretendard Variable",
					"Pretendard",
					"-apple-system",
					"BlinkMacSystemFont",
					"Apple SD Gothic Neo",
					"Segoe UI",
					"Roboto",
					"sans-serif",
				],
				display: ["Anton", "Impact", "sans-serif"],
			},
			fontSize: {
				caption: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
				sm: ["13px", { lineHeight: "1.65" }],
				"sm-lg": ["14px", { lineHeight: "1.65" }],
				body: ["15px", { lineHeight: "1.65" }],
				"body-lg": ["16px", { lineHeight: "1.65" }],
				h3: ["16px", { lineHeight: "1.25", fontWeight: "600" }],
				"h3-lg": ["18px", { lineHeight: "1.25", fontWeight: "600" }],
				h2: ["19px", { lineHeight: "1.25", fontWeight: "700" }],
				"h2-lg": ["22px", { lineHeight: "1.25", fontWeight: "700" }],
				h1: ["24px", { lineHeight: "1.25", fontWeight: "700" }],
				"h1-lg": ["32px", { lineHeight: "1.25", fontWeight: "700" }],
				display: ["32px", { lineHeight: "1.1", fontWeight: "800" }],
				"display-lg": ["48px", { lineHeight: "1.1", fontWeight: "800" }],
				stat: ["28px", { lineHeight: "1.1", fontWeight: "800" }],
				"stat-lg": ["36px", { lineHeight: "1.1", fontWeight: "800" }],
				"stat-label": [
					"11px",
					{ lineHeight: "1.2", fontWeight: "600", letterSpacing: "0.06em" },
				],
			},
			borderRadius: {
				sm: "6px",
				md: "12px",
				lg: "20px",
			},
			boxShadow: {
				soft: "0 1px 2px rgb(var(--ink-900) / .06), 0 2px 8px rgb(var(--ink-900) / .04)",
				raised: "0 4px 16px rgb(var(--ink-900) / .08)",
				modal: "0 16px 48px rgb(var(--ink-900) / .18)",
			},
			maxWidth: {
				container: "1120px",
			},
			spacing: {
				header: "64px",
				"header-sm": "56px",
				"nav-bottom": "64px",
			},
			keyframes: {
				shimmer: {
					"0%": { backgroundPosition: "-400px 0" },
					"100%": { backgroundPosition: "400px 0" },
				},
			},
			animation: {
				shimmer: "shimmer 1.4s linear infinite",
			},
			backgroundImage: {
				shimmer:
					"linear-gradient(90deg, rgb(var(--ink-100)) 25%, rgb(var(--ink-50)) 50%, rgb(var(--ink-100)) 75%)",
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
};

export default config;
