"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { hideCelebrationForToday, readHiddenUntil, shouldShowCelebration } from "../celebration";
import styles from "./celebrationPopup.module.css";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap";
const CONFETTI_COLORS = ["#ffd400", "#ffffff", "#ff5a5f", "#f2b705"];
// 렌더마다 위치가 바뀌지 않도록 고정된 꽃가루 배치
const CONFETTI = Array.from({ length: 28 }, (_, index) => ({
	left: `${(index * 37) % 100}%`,
	delay: `${(index * 0.43) % 6}s`,
	duration: `${5 + ((index * 7) % 5)}s`,
	color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}));

/** 현수막 본문. 서버 렌더 테스트에서도 그대로 확인할 수 있게 분리한다. */
export function CelebrationBanner({ onClose, onHideToday }: { onClose: () => void; onHideToday: () => void }) {
	return (
		<div className={styles.stage}>
			<span className={`${styles.pole} ${styles.poleLeft}`} aria-hidden="true" />
			<span className={`${styles.pole} ${styles.poleRight}`} aria-hidden="true" />
			<div className={styles.bunting} aria-hidden="true">
				{Array.from({ length: 16 }, (_, index) => <span key={index} />)}
			</div>
			<div className={styles.banner}>
				<span className={styles.frame} aria-hidden="true" />
				<span className={styles.medal} aria-hidden="true">🥇</span>
				<h2 id="celebration-title" className={styles.headline}>
					<span className={styles.celebrate}><span className={styles.sparkle} aria-hidden="true">✦</span>경축<span className={styles.sparkle} aria-hidden="true">✦</span></span>
					<span className={styles.player}>이소희 선수<span className={styles.ball} aria-hidden="true">🏀</span></span>
					<span className={styles.achievement}>2026 아이치·나고야 아시안게임 여자농구 금메달 획득</span>
				</h2>
				<p className={styles.signature}>- 이소희 희망단 일동 -</p>
				<span className={styles.stamp} aria-hidden="true">12년<br />만에!</span>
			</div>
			<div className={styles.actions}>
				<Link href="/videos" className={styles.primary} onClick={onClose}>금메달 영상 보러 가기</Link>
				<button type="button" className={styles.secondary} onClick={onHideToday}>오늘 하루 보지 않기</button>
				<button type="button" className={styles.secondary} onClick={onClose} data-autofocus>닫기</button>
			</div>
		</div>
	);
}

export default function CelebrationPopup() {
	const [open, setOpen] = useState(false);
	const dialogRef = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setOpen(false), []);
	const hideToday = useCallback(() => {
		hideCelebrationForToday(Date.now());
		setOpen(false);
	}, []);

	useEffect(() => {
		if (shouldShowCelebration(Date.now(), readHiddenUntil())) setOpen(true);
	}, []);

	useEffect(() => {
		if (!open) return;
		if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
			const font = document.createElement("link");
			font.rel = "stylesheet";
			font.href = FONT_URL;
			document.head.appendChild(font);
		}
		const restoreFocus = document.activeElement as HTMLElement | null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
			if (event.key !== "Tab" || !dialogRef.current) return;
			const focusable = dialogRef.current.querySelectorAll<HTMLElement>("a[href],button");
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = previousOverflow;
			restoreFocus?.focus?.();
		};
	}, [open]);

	if (!open) return null;
	return createPortal(
		<div
			ref={dialogRef}
			className={styles.overlay}
			role="dialog"
			aria-modal="true"
			aria-labelledby="celebration-title"
			onClick={(event) => {
				if (event.target === event.currentTarget) close();
			}}
		>
			<div className={styles.confetti} aria-hidden="true">
				{CONFETTI.map((piece, index) => (
					<span
						key={index}
						style={{ left: piece.left, background: piece.color, animationDelay: piece.delay, animationDuration: piece.duration }}
					/>
				))}
			</div>
			<CelebrationBanner onClose={close} onHideToday={hideToday} />
		</div>,
		document.body
	);
}
