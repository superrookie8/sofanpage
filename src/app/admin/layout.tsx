import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import "./admin.css";

export const metadata: Metadata = {
	title: { absolute: "SUPER SOHEE 관리자" },
	description: "SUPER SOHEE 운영 관리",
	robots: { index: false, follow: false, noarchive: true },
};
export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return <div className="admin-root"><AdminShell>{children}</AdminShell></div>;
}
