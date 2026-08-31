"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { isDarkShellPath } from "@/shared/nav/navItems";
import { cn } from "../cn";

/**
 * 본문 래퍼. 다크 셸 여부를 body에 반영하고(페이지 바닥까지 어둡게),
 * 하단 탭에 가리지 않도록 모바일 하단 여백을 확보한다.
 *
 * 페이지 전환은 opacity + y 8px (기존 translateX(100%) 슬라이드 제거).
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const dark = isDarkShellPath(pathname);

	useEffect(() => {
		if (dark) {
			document.body.dataset.shell = "dark";
			return () => {
				delete document.body.dataset.shell;
			};
		}
		delete document.body.dataset.shell;
	}, [dark]);

	return (
		<motion.main
			key={pathname}
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.24, ease: "easeOut" }}
			className={cn(
				"mx-auto w-full max-w-container px-4 pb-[calc(var(--nav-bottom,64px)+24px)] pt-6 lg:pb-16",
				dark && "text-white"
			)}
			style={{ ["--nav-bottom" as string]: "64px" }}
		>
			{children}
		</motion.main>
	);
}
