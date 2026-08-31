import type { Config } from "tailwindcss";

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
			colors: {
				brand: {
					50: "#FFF1F2",
					100: "#FFE1E3",
					200: "#FFC7CB",
					400: "#F4576B",
					500: "#E11D33",
					600: "#C1152A",
					700: "#8F0F1F",
				},
				ink: {
					50: "#F8F6F9",
					100: "#EFECF1",
					200: "#DDD9E0",
					300: "#ADA7B2",
					500: "#6B6570",
					700: "#3A363F",
					900: "#17151A",
				},
				// ink-900 배경 위에 얹는 다크 카드 서피스
				surface: {
					dark: "#26232B",
				},
				win: "#0E9F6E",
				lose: "#6B6570",
				info: "#2563EB",
				warn: "#D97706",
				medal: {
					gold: "#F5C542",
					silver: "#C9CDD6",
					bronze: "#C88A5B",
				},
				kakao: "#FEE500",
				naver: "#03C75A",
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
				soft: "0 1px 2px rgba(23,21,26,.06), 0 2px 8px rgba(23,21,26,.04)",
				raised: "0 4px 16px rgba(23,21,26,.08)",
				modal: "0 16px 48px rgba(23,21,26,.18)",
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
					"linear-gradient(90deg,#EFECF1 25%,#F8F6F9 50%,#EFECF1 75%)",
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
};

export default config;
