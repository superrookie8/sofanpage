import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";

export async function GET() {
	const response = await adminBackendFetch("/api/admin/events");
	if (!response.ok) return response;
	const events = await response.json() as Array<Record<string, unknown>>;
	return NextResponse.json({
		events: events.map((event) => ({
			...event,
			_id: event.id,
			checkFields: event.checkFields && typeof event.checkFields === "object"
				? Object.fromEntries(Object.entries(event.checkFields).map(([key, value]) => [key.replace(/^check(\d+)$/, "check_$1"), value]))
				: {},
		})),
	});
}
