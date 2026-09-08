"use client";
import { usePathname } from "next/navigation";
import AppShell from "./appShell";
import Header from "./header";
import BottomNav from "./bottomNav";
import GoogleAnalytics from "@/components/analytics/googleAnalytics";

export default function SiteSurface({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	if (pathname === "/admin" || pathname.startsWith("/admin/")) return <>{children}</>;
	return <><GoogleAnalytics /><Header /><AppShell>{children}</AppShell><BottomNav /></>;
}
