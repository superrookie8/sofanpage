"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { track } from "@/lib/analytics/events";
import {
	getNavItems,
	isDarkShellPath,
	isMyPageEnabled,
	isNavItemActive,
} from "@/shared/nav/navItems";
import Wordmark from "./wordmark";
import NavIcon from "./navIcon";
import Button from "../primitives/button";
import { cn } from "../cn";

/**
 * 데스크톱(≥1024): 64px 헤더, 스크롤 시 52px로 축소.
 * 모바일(<1024): 56px 상단 바 + 하단 탭(BottomNav)이 내비게이션을 담당한다.
 */
export default function Header() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	const dark = isDarkShellPath(pathname);
	const navItems = getNavItems();
	const isLoggedIn = !!session;
	// 마이페이지는 메뉴 목록이 아니라 계정 영역에서 다룬다(navItems.ts 참고).
	// 로그인해야 열리는 화면이라 로그인 상태에서만 노출한다.
	const showMyPage = isLoggedIn && isMyPageEnabled();

	// 경로가 바뀌면 모바일 메뉴를 닫는다.
	useEffect(() => {
		setMenuOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!menuOpen) return;
		const onPointerDown = (event: MouseEvent) => {
			if (
				menuRef.current?.contains(event.target as Node) ||
				menuButtonRef.current?.contains(event.target as Node)
			) {
				return;
			}
			setMenuOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMenuOpen(false);
		};
		document.addEventListener("mousedown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("mousedown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [menuOpen]);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const handleLogout = async () => {
		track("logout");
		try {
			// 모바일 사파리에서 next-auth 리다이렉트가 동작하지 않는 경우가 있어
			// redirect:false + 수동 이동으로 처리한다.
			await signOut({ redirect: false, callbackUrl: "/home" });
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			window.location.href = "/home";
		}
	};

	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full border-b transition-shadow",
				dark ? "bg-ink-900 border-ink-700" : "bg-white border-ink-200",
				scrolled && "shadow-soft"
			)}
		>
			<div
				className={cn(
					"mx-auto flex max-w-container items-center gap-8 px-4 transition-[height] duration-200",
					"h-header-sm lg:h-header",
					scrolled && "lg:h-[52px]"
				)}
			>
				<Wordmark dark={dark} />

				<nav className="hidden flex-1 items-center gap-6 lg:flex">
					{navItems.map((item) => {
						const active = isNavItemActive(pathname, item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() =>
									track("nav_click", {
										nav_item: item.label,
										nav_location: "header",
									})
								}
								aria-current={active ? "page" : undefined}
								className={cn(
									"relative py-1 text-[15px] transition-colors",
									active
										? cn("font-bold", dark ? "text-white" : "text-ink-900")
										: cn(
												"font-medium",
												dark
													? "text-ink-300 hover:text-white"
													: "text-ink-500 hover:text-ink-900"
										  )
								)}
							>
								{item.label}
								{active && (
									<span className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-brand-500" />
								)}
							</Link>
						);
					})}
				</nav>

				<button
					ref={menuButtonRef}
					type="button"
					onClick={() => setMenuOpen((open) => !open)}
					aria-label="메뉴 열기"
					aria-expanded={menuOpen}
					className={cn(
						"ml-auto flex h-11 w-11 items-center justify-center rounded-[10px] lg:hidden",
						dark ? "text-white hover:bg-white/10" : "text-ink-700 hover:bg-ink-100"
					)}
				>
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={1.8}
						strokeLinecap="round"
						aria-hidden
					>
						{menuOpen ? (
							<path d="M6 6l12 12M18 6L6 18" />
						) : (
							<path d="M4 7h16M4 12h16M4 17h16" />
						)}
					</svg>
				</button>

				<div className="ml-auto hidden items-center gap-2 lg:flex lg:ml-0">
					{showMyPage && (
						<Link
							href="/mypage"
							aria-current={
								isNavItemActive(pathname, "/mypage") ? "page" : undefined
							}
							className={cn(
								"flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[14px]",
								isNavItemActive(pathname, "/mypage")
									? "font-bold text-brand-500"
									: dark
									? "font-medium text-ink-300 hover:bg-white/10"
									: "font-medium text-ink-700 hover:bg-ink-50"
							)}
						>
							<NavIcon name="me" size={18} />
							마이페이지
						</Link>
					)}
					{isLoggedIn ? (
						<Button
							variant={dark ? "secondaryDark" : "secondary"}
							size="sm"
							onClick={handleLogout}
							className="lg:h-9 lg:px-4 lg:text-[14px]"
						>
							로그아웃
						</Button>
					) : (
						<Link href="/login">
							<Button
								variant={dark ? "secondaryDark" : "secondary"}
								size="sm"
								className="lg:h-9 lg:px-4 lg:text-[14px]"
							>
								로그인
							</Button>
						</Link>
					)}
				</div>
			</div>

			{menuOpen && (
				<div
					ref={menuRef}
					className={cn(
						"absolute inset-x-0 top-full border-b shadow-raised lg:hidden",
						dark ? "bg-ink-900 border-ink-700" : "bg-white border-ink-200"
					)}
				>
					<ul className="mx-auto max-w-container px-4 py-2">
						{navItems.map((item) => {
							const active = isNavItemActive(pathname, item.href);
							return (
								<li key={item.href}>
									<Link
										href={item.href}
										onClick={() =>
											track("nav_click", {
												nav_item: item.label,
												nav_location: "drawer",
											})
										}
										aria-current={active ? "page" : undefined}
										className={cn(
											"flex min-h-[44px] items-center gap-3 rounded-[10px] px-2 text-[15px]",
											active
												? "font-bold text-brand-500"
												: dark
												? "font-medium text-ink-300"
												: "font-medium text-ink-700"
										)}
									>
										<NavIcon name={item.icon} size={20} />
										{item.label}
									</Link>
								</li>
							);
						})}
						{showMyPage && (
							<li>
								<Link
									href="/mypage"
									aria-current={
										isNavItemActive(pathname, "/mypage") ? "page" : undefined
									}
									className={cn(
										"flex min-h-[44px] items-center gap-3 rounded-[10px] px-2 text-[15px]",
										isNavItemActive(pathname, "/mypage")
											? "font-bold text-brand-500"
											: dark
											? "font-medium text-ink-300"
											: "font-medium text-ink-700"
									)}
								>
									<NavIcon name="me" size={20} />
									마이페이지
								</Link>
							</li>
						)}
						<li className="mt-2 border-t border-ink-200 pt-2">
							{isLoggedIn ? (
								<button
									type="button"
									onClick={handleLogout}
									className="flex min-h-[44px] w-full items-center px-2 text-[15px] font-semibold text-brand-700"
								>
									로그아웃
								</button>
							) : (
								<Link
									href="/login"
									className="flex min-h-[44px] items-center px-2 text-[15px] font-semibold text-brand-700"
								>
									로그인
								</Link>
							)}
						</li>
					</ul>
				</div>
			)}
		</header>
	);
}
