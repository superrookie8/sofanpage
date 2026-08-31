import { adminBackendFetch } from "@/lib/admin/backend";

export async function GET() {
	return adminBackendFetch("/api/admin/schedules/seasons");
}
