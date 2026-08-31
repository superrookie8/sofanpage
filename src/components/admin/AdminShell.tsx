"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type IconName = "home" | "profile" | "stats" | "photos" | "schedule" | "events" | "guestbook" | "logout" | "menu";

const navItems: Array<{ href: string; label: string; heading?: string; description: string; icon: IconName }> = [
	{ href: "/admin", label: "대시보드", description: "운영 현황", icon: "home" },
	{ href: "/admin/profile", label: "프로필", heading: "Manage Profiles", description: "선수 소개", icon: "profile" },
	{ href: "/admin/stats", label: "기록", heading: "Manage Stats", description: "시즌 스탯", icon: "stats" },
	{ href: "/admin/photos", label: "사진 업로드", description: "갤러리 추가", icon: "photos" },
	{ href: "/admin/deletephotos", label: "사진 관리", heading: "Delete Photos", description: "갤러리 정리", icon: "photos" },
	{ href: "/admin/schedule", label: "경기 일정", heading: "Manage Game Schedules", description: "시즌 스케줄", icon: "schedule" },
	{ href: "/admin/events", label: "이벤트", heading: "Manage Events", description: "팬 이벤트", icon: "events" },
	{ href: "/admin/news", label: "뉴스", description: "기사 관리", icon: "events" },
	{ href: "/admin/guestbooks", label: "방명록", description: "팬 메시지", icon: "guestbook" },
];

function AdminIcon({ name }: { name: IconName }) {
	const paths: Record<IconName, React.ReactNode> = {
		home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
		profile: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
		stats: <><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
		photos: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/></>,
		schedule: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h2M14 14h2M8 17h2"/></>,
		events: <path d="M12 3 9.5 8.2 4 9l4 3.9L7 18.5l5-2.7 5 2.7-1-5.6L20 9l-5.5-.8Z"/>,
		guestbook: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 5.5v15M8 7h8M8 11h6"/></>,
		logout: <><path d="M10 5H5v14h5"/><path d="m14 8 4 4-4 4M8 12h10"/></>,
		menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
	};

	return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const [authChecked, setAuthChecked] = useState(false);
	const isLogin = pathname === "/admin/login";

	useEffect(() => {
		if (isLogin) {
			setAuthChecked(true);
			return;
		}
		fetch("/api/admin/session", { cache: "no-store" }).then((response) => {
			if (!response.ok) {
				router.replace("/admin/login");
				return;
			}
			setAuthChecked(true);
		}).catch(() => router.replace("/admin/login"));
	}, [isLogin, router]);

	useEffect(() => setMenuOpen(false), [pathname]);

	const currentItem = useMemo(() => navItems.find((item) => item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href)) ?? navItems[0], [pathname]);

	if (isLogin) return <>{children}</>;
	if (!authChecked) return <div className="admin-loading" role="status"><span className="admin-loading-mark">06</span><p>관리자 화면을 준비하고 있어요</p></div>;

	const logout = async () => {
		await fetch("/api/admin/session", { method: "DELETE" });
		router.replace("/admin/login");
		router.refresh();
	};

	return (
		<div className="admin-shell">
			{menuOpen && <button className="admin-menu-overlay" aria-label="메뉴 닫기" onClick={() => setMenuOpen(false)} />}
			<aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`}>
				<Link href="/admin" className="admin-brand" aria-label="관리자 홈">
					<span className="admin-brand-number">06</span>
					<span><strong>SUPER SOHEE</strong><small>ADMIN OFFICE</small></span>
				</Link>
				<div className="admin-player-chip">
					<div className="admin-player-avatar">이</div>
					<div><strong>이소희</strong><span>BNK SUM · GUARD</span></div>
					<em>활성</em>
				</div>
				<nav className="admin-nav" aria-label="관리자 메뉴">
					<p className="admin-nav-label">MANAGEMENT</p>
					{navItems.map((item) => {
						const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
						return <Link key={item.href} href={item.href} className={active ? "is-active" : ""}><span className="admin-nav-icon"><AdminIcon name={item.icon} /></span><span><strong>{item.label}</strong><small>{item.description}</small></span></Link>;
					})}
				</nav>
				<button className="admin-logout" onClick={logout}><AdminIcon name="logout" /><span>로그아웃</span></button>
			</aside>
			<div className="admin-workspace">
				<header className="admin-topbar">
					<button className="admin-menu-button" aria-label="메뉴 열기" onClick={() => setMenuOpen(true)}><AdminIcon name="menu" /></button>
					<div><span>SUPER SOHEE / ADMIN</span><h1>{currentItem.heading ?? currentItem.label}</h1></div>
					<div className="admin-server-status"><i /><span><strong>SERVER ONLINE</strong><small>Local · 8080</small></span></div>
				</header>
				<main className="admin-content">{children}</main>
			</div>
		</div>
	);
}
