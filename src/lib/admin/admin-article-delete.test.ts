import { afterEach, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const backend = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ adminBackendFetch: backend }));
import { DELETE } from "@/app/api/admin/articles/[id]/route";
import { GET } from "@/app/api/admin/articles/route";
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });

const remove = (id: string, origin = "https://supersohee.com") =>
	DELETE(new NextRequest(`https://supersohee.com/api/admin/articles/${id}`, { method: "DELETE", headers: { origin } }), { params: Promise.resolve({ id }) });

it("deletes exactly one article by its database ID", async () => {
	vi.stubEnv("ADMIN_APP_ORIGIN", "https://supersohee.com");
	backend.mockResolvedValue(new NextResponse(null, { status: 204 }));
	const result = await remove("6abf8f8fb4088c8553eff9c9");
	expect(result.status).toBe(204);
	expect(backend).toHaveBeenCalledWith("/api/admin/articles/6abf8f8fb4088c8553eff9c9", { method: "DELETE" });
});

it.each(["import", "6ABF8F8FB4088C8553EFF9C9", "6abf8f8fb4088c8553eff9c", "..%2Fvideos"])("rejects invalid article ID '%s' before calling the backend", async (id) => {
	vi.stubEnv("ADMIN_APP_ORIGIN", "https://supersohee.com");
	const result = await remove(id);
	expect(result.status).toBe(400);
	expect(backend).not.toHaveBeenCalled();
});

it("rejects cross-origin deletion", async () => {
	vi.stubEnv("ADMIN_APP_ORIGIN", "https://supersohee.com");
	const result = await remove("6abf8f8fb4088c8553eff9c9", "https://evil.example.com");
	expect(result.status).toBe(403);
	expect(backend).not.toHaveBeenCalled();
});

it("forwards only known sources and a bounded title query to the list", async () => {
	backend.mockResolvedValue(NextResponse.json({ content: [] }));
	await GET(new NextRequest(`https://supersohee.com/api/admin/articles?page=2&size=20&source=other&q=${encodeURIComponent(" 아는형님 ")}`));
	expect(backend).toHaveBeenLastCalledWith(`/api/admin/articles?page=2&size=20&source=other&q=${encodeURIComponent("아는형님")}`);
	await GET(new NextRequest(`https://supersohee.com/api/admin/articles?source=evil&q=${"가".repeat(150)}`));
	const forwarded = new URL(`https://x${backend.mock.calls[1][0]}`).searchParams;
	expect(forwarded.has("source")).toBe(false);
	expect(forwarded.get("q")).toHaveLength(100);
});
