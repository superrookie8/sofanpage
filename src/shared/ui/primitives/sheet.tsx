"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../cn";

export interface SheetProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	/** 다크 셸 위에서 열리는 시트 */
	dark?: boolean;
	className?: string;
}

const FOCUSABLE =
	'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/**
 * 모바일=바텀시트 상승 / 데스크톱=중앙 모달.
 * 포커스 트랩 · ESC 닫기 · 배경 스크롤 잠금을 포함한다.
 */
export default function Sheet({
	open,
	onClose,
	title,
	children,
	dark,
	className,
}: SheetProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const restoreFocusRef = useRef<HTMLElement | null>(null);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.stopPropagation();
				onClose();
				return;
			}
			if (event.key !== "Tab" || !panelRef.current) return;

			const focusable =
				panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		},
		[onClose]
	);

	useEffect(() => {
		if (!open) return;

		restoreFocusRef.current = document.activeElement as HTMLElement | null;
		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", handleKeyDown, true);

		// 패널이 마운트된 뒤 첫 포커스 대상으로 이동
		const raf = requestAnimationFrame(() => {
			const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
			(focusable?.[0] ?? panelRef.current)?.focus();
		});

		return () => {
			cancelAnimationFrame(raf);
			document.body.style.overflow = overflow;
			document.removeEventListener("keydown", handleKeyDown, true);
			restoreFocusRef.current?.focus?.();
		};
	}, [open, handleKeyDown]);

	if (typeof document === "undefined") return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
						className="absolute inset-0 bg-ink-900/55"
					/>
					<motion.div
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-label={title}
						tabIndex={-1}
						initial={{ opacity: 0, y: 24, scale: 1 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 24 }}
						transition={{ duration: 0.24, ease: "easeOut" }}
						className={cn(
							"relative w-full max-h-[88vh] overflow-y-auto rounded-t-lg md:max-w-[520px] md:rounded-lg",
							dark ? "bg-surface-dark text-white" : "bg-white",
							"shadow-modal",
							className
						)}
					>
						{/* 모바일 그랩 핸들 */}
						<div className="sticky top-0 z-10 flex justify-center bg-inherit pt-2.5 pb-1 md:hidden">
							<span className="h-1 w-9 rounded-full bg-ink-200" />
						</div>
						{title && (
							<div className="px-5 pb-2 pt-2 md:pt-5">
								<h2 className={cn("text-h2", dark && "text-white")}>{title}</h2>
							</div>
						)}
						<div className="px-5 pb-6">{children}</div>
						<button
							type="button"
							onClick={onClose}
							aria-label="닫기"
							className={cn(
								"absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-[20px]",
								dark ? "text-ink-300 hover:bg-white/10" : "text-ink-500 hover:bg-ink-100"
							)}
						>
							&times;
						</button>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	);
}
