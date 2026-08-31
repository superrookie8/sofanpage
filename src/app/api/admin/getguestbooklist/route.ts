import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { toLegacyAdminGuestbook } from "@/lib/admin/adapters";

export async function GET(request: NextRequest) {
	const requestedPage = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
	const size = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("page_size") ?? 10)));
	const name = request.nextUrl.searchParams.get("name")?.trim() ?? "";
	const query = new URLSearchParams({ page: String(requestedPage - 1), size: String(size) });
	if (name) query.set("name", name);
	const response = await adminBackendFetch(`/api/admin/guestbooks?${query}`);
	if (!response.ok) return response;
	const body = await response.json() as Record<string, unknown>;
	const content = Array.isArray(body.content) ? body.content : [];
	return NextResponse.json({
		entries: content.map(toLegacyAdminGuestbook),
		total_entries: Number(body.totalElements ?? 0),
		total_pages: Number(body.totalPages ?? 0),
		has_next: Boolean(body.hasNext),
	});
}
