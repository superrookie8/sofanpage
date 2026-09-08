import "server-only";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { SITE_URL } from "@/lib/seo";

/** Only the encrypted public NextAuth cookie is trusted; role is checked by Spring on every request. */
export async function getAdminToken(): Promise<string | null> {
	try {
		const incoming = await headers();
		const request = new NextRequest(SITE_URL, { headers: { cookie: incoming.get("cookie") ?? "" } });
		return await getRequestAccessToken(request);
	} catch {
		return null;
	}
}
