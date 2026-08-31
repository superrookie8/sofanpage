import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/server/http/backendApi";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ eventId: string }> }
) {
	const { eventId } = await params;
	return proxyBackendRequest({
		path: `/api/events/${encodeURIComponent(eventId)}`,
		requestUrl: req.url,
	});
}
