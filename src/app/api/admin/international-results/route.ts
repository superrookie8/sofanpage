import { NextRequest } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function GET() {
	return adminBackendFetch("/api/admin/international-results");
}

export async function POST(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;

	return adminBackendFetch("/api/admin/international-results", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(await request.json()),
	});
}
