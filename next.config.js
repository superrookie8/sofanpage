/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: "/api/(.*)",
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, no-cache, must-revalidate, proxy-revalidate",
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
		],
	},
};

module.exports = nextConfig;
