"use client";
import React from "react";
import Image from "next/image";
import { useLoading } from "@/context/LoadingContext";
import { CHIBI } from "./chibi";
import { cn } from "./cn";

export interface LoadingIndicatorProps {
	/** 스크린리더에만 읽히는 설명. 화면에는 Anton 워드마크만 노출한다. */
	label?: string;
	className?: string;
}

/**
 * 시안 §04 — 로딩은 브랜드 치비(슛 동작) + Anton 워드마크 + 브랜드 진행 바.
 *
 * 진행률을 알 수 없는 자리라 바는 indeterminate로 트랙을 통과시킨다.
 * (트랙 ink-100 / 필 brand-500 #E11D33 / 높이 6px — 시안 값 그대로)
 *
 * 밝은 배경 전용이다. 화이트 유니폼 치비를 ink-900 위에 얹으면 선화가
 * 배경에 묻혀 형체가 읽히지 않아, 오버레이도 밝은 카드를 깔고 그 위에 쓴다.
 * 모션은 globals.css의 prefers-reduced-motion 블록이 일괄로 멈춘다.
 */
export function LoadingIndicator({
	label = "불러오는 중",
	className,
}: LoadingIndicatorProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={cn("flex flex-col items-center", className)}
		>
			<Image
				src={CHIBI.shotBlack}
				alt=""
				width={96}
				height={96}
				className="h-32 w-auto animate-loader-bob"
			/>
			<p className="mt-1.5 font-display text-[13px] tracking-[.2em] text-ink-700">
				LOADING
			</p>
			<div
				aria-hidden
				className="mt-2.5 h-1.5 w-[132px] overflow-hidden rounded-full bg-ink-100"
			>
				<div className="h-full w-1/3 rounded-full bg-brand-500 animate-loader-bar" />
			</div>
			<span className="sr-only">{label}</span>
		</div>
	);
}

/** 전역 LoadingContext에 묶인 풀스크린 오버레이. */
const LoadingSpinner: React.FC = () => {
	const { isLoading } = useLoading();
	if (!isLoading) return null;

	return (
		<div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/70 backdrop-blur-[2px]">
			<div className="rounded-lg border border-ink-200 bg-white px-7 pb-6 pt-5 shadow-modal">
				<LoadingIndicator />
			</div>
		</div>
	);
};

export default LoadingSpinner;
