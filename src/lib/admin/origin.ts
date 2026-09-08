import { SITE_URL } from "@/lib/seo";

export function trustedAdminOrigin(env: Record<string, string | undefined>, requestUrl?: string): string {
	const configured = env.ADMIN_APP_ORIGIN ?? env.NEXTAUTH_URL ?? (env.NODE_ENV === "production" ? SITE_URL : requestUrl);
	const url = new URL(configured ?? SITE_URL);
	if (url.username || url.password || url.search || url.hash || url.pathname !== "/" || !["http:", "https:"].includes(url.protocol) || (env.NODE_ENV === "production" && url.protocol !== "https:")) throw new Error("Invalid site origin");
	return url.origin;
}
