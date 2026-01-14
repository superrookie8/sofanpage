/** @type {import('next').NextConfig} */
const nextConfig = {
	compiler: {
		styledComponents: true,
	},
	async headers() {
		return [
			{
				// API 응답은 사용자/세션에 따라 달라질 수 있어 캐싱 금지
				// (특히 next-auth의 /api/auth/*, 그리고 인증이 필요한 /api/diary 등)
				// 모바일 Safari에서 로그아웃/세션 반영이 안 되는 원인이 될 수 있음
				source: "/api/(.*)",
				headers: [
					{
						key: "Cache-Control",
						value: "private, no-store, max-age=0",
					},
				],
			},
			{
				// Brotli 압축 파일에 대한 헤더 설정
				source: "/unity/:all*.br", // 모든 .br 파일에 대해 설정
				headers: [
					{
						key: "Content-Encoding",
						value: "br", // Brotli 압축 형식임을 브라우저에 알림
					},
					{
						key: "Content-Type",
						value: "application/octet-stream", // 적절한 MIME 타입 설정
					},
				],
			},
			{
				// WebAssembly 파일에 대한 헤더 설정 (필요한 경우)
				source: "/unity/:all*.wasm",
				headers: [
					{
						key: "Content-Type",
						value: "application/wasm",
					},
				],
			},
		];
	},
	images: {
		qualities: [75, 100],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "jumpbcdn.iwinv.biz",
				pathname: "/news/data/**",
			},
			{
				protocol: "https",
				hostname: "cdn.rookie.co.kr",
				pathname: "/news/thumbnail/**",
			},
			{
				protocol: "https",
				hostname: "jumpball.co.kr",
			},
			{
				protocol: "https",
				hostname: "rookie.co.kr",
			},
			{
				protocol: "https",
				hostname:
					"supersohee-images-all.92d40bb4fa2c6db4a006f8b35dcb1d11.r2.cloudflarestorage.com",
			},
		],
	},
	webpack: (config, { isServer, dev }) => {
		// 프로덕션 빌드에서 locatorjs 관련 모듈 제외
		if (!dev && !isServer) {
			config.resolve.alias = {
				...config.resolve.alias,
				"@locator/runtime": false,
				"@locator/babel-jsx": false,
			};
		}
		return config;
	},
};

module.exports = nextConfig;
