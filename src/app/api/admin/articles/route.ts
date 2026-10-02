import { NextRequest } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function GET(request: NextRequest) {
	const page = Math.max(0, Number(request.nextUrl.searchParams.get("page") ?? 0));
	const size = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("size") ?? 20)));
	const query = new URLSearchParams({ page: String(page), size: String(size) });
	const source = request.nextUrl.searchParams.get("source");
	if (source && ["jumpball", "rookie", "other", "manual"].includes(source)) query.set("source", source);
	const q = request.nextUrl.searchParams.get("q")?.trim();
	if (q) query.set("q", q.slice(0, 100));
	return adminBackendFetch(`/api/admin/articles?${query}`);
}

export async function POST(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const input = await request.json() as { title?: unknown; content?: unknown };
	return adminBackendFetch("/api/admin/articles", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ title: input.title, content: input.content }),
	});
}
