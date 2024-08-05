/** @type {import('next').NextConfig} */
const nextConfig = {
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
		];
	},
	images: {
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
