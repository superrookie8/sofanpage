/** @type {import('next').NextConfig} */
const nextConfig = {
	compiler: {
		styledComponents: true,
	},
	async headers() {
		return [
			{
				source: "/api/(.*)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=0, stale-while-revalidate=86400",
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
		],
	},
};

module.exports = nextConfig;
