import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/server/http/backendApi";

export async function GET(req: NextRequest) {
	return proxyBackendRequest({
		path: "/api/schedules",
		requestUrl: req.url,
	});
}
