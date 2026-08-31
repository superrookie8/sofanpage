import { redirect } from "next/navigation";
import { ADMIN_ROOT_DESTINATION } from "@/lib/admin/root-route";

export default function Page() {
	redirect(ADMIN_ROOT_DESTINATION);
}
