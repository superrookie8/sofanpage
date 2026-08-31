"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	getBottomTabs,
	isDarkShellPath,
	isNavItemActive,
} from "@/shared/nav/navItems";
import NavIcon from "./navIcon";
import { cn } from "../cn";

/** 모바일 하단 고정 탭. 높이 64px + safe-area. 터치 타깃 44px 이상. */
export default function BottomNav() {
	const pathname = usePathname();
	const dark = isDarkShellPath(pathname);
	const tabs = getBottomTabs();

	return (
		<nav
			aria-label="주요 메뉴"
			className={cn(
				"fixed bottom-0 left-0 right-0 z-50 border-t safe-bottom lg:hidden",
				dark ? "bg-ink-900 border-ink-700" : "bg-white border-ink-200"
			)}
		>
			<ul className="flex h-nav-bottom items-stretch">
				{tabs.map((item) => {
					const active = isNavItemActive(pathname, item.href);
					return (
						<li key={item.href} className="flex-1">
							<Link
								href={item.href}
								aria-current={active ? "page" : undefined}
								className={cn(
									"flex h-full min-h-[44px] flex-col items-center justify-center gap-1 transition-colors",
									active
										? "text-brand-500 font-bold"
										: dark
										? "text-ink-300"
										: "text-ink-500"
								)}
							>
								<NavIcon name={item.icon} />
								<span className="text-[10px] leading-none">{item.label}</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
