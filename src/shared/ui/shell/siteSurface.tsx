"use client";
import { usePathname } from "next/navigation";
import AppShell from "./appShell";
import Header from "./header";
import BottomNav from "./bottomNav";
import SiteFooter from "./siteFooter";
import GoogleAnalytics from "@/components/analytics/googleAnalytics";
import { isDarkShellPath } from "@/shared/nav/navItems";

export default function SiteSurface({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	if (pathname === "/admin" || pathname.startsWith("/admin/")) return <>{children}</>;
	const dark = isDarkShellPath(pathname);
	return (
		<>
			<GoogleAnalytics />
			<Header />
			<AppShell footer={<SiteFooter dark={dark} />}>{children}</AppShell>
			<BottomNav />
		</>
	);
}
