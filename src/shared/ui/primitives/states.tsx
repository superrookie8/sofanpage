import Image from "next/image";
import Button from "./button";
import { CHIBI, type ChibiKey } from "../chibi";
import { cn } from "../cn";

export interface EmptyStateProps {
	title: string;
	description?: string;
	actionLabel?: string;
	onAction?: () => void;
	dark?: boolean;
	/** 상황에 맞는 치비 일러스트. 기본값은 홈 유니폼 정면. */
	illustration?: ChibiKey;
	className?: string;
}

/** 시안 §04 — 치비 일러스트 + 한 줄 설명 + CTA. */
export function EmptyState({
	title,
	description,
	actionLabel,
	onAction,
	dark,
	illustration = "red",
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"rounded-md border px-4 py-6 text-center",
				dark ? "bg-surface-dark border-ink-700" : "bg-white border-ink-200",
				className
			)}
		>
			<Image
				src={CHIBI[illustration]}
				alt=""
				width={96}
				height={96}
				className="mx-auto h-24 w-auto"
			/>
			<p
				className={cn(
					"mt-2.5 text-[14px] font-semibold",
					dark ? "text-white" : "text-ink-900"
				)}
			>
				{title}
			</p>
			{description && (
				<p className="mt-1 text-caption text-ink-500">{description}</p>
			)}
			{actionLabel && onAction && (
				<Button size="sm" className="mt-3" onClick={onAction}>
					{actionLabel}
				</Button>
			)}
		</div>
	);
}

export interface ErrorStateProps {
	title?: string;
	description?: string;
	onRetry?: () => void;
	dark?: boolean;
	/** 기본은 눈물 일러스트. */
	illustration?: ChibiKey;
	className?: string;
}

export function ErrorState({
	title = "불러오지 못했어요",
	description = "잠시 후 다시 시도해주세요",
	onRetry,
	dark,
	illustration = "tears",
	className,
}: ErrorStateProps) {
	return (
		<div
			role="alert"
			className={cn(
				"rounded-md border px-4 py-6 text-center",
				dark ? "bg-surface-dark border-ink-700" : "bg-white border-ink-200",
				className
			)}
		>
			<Image
				src={CHIBI[illustration]}
				alt=""
				width={96}
				height={96}
				className="mx-auto h-24 w-auto"
			/>
			<p
				className={cn(
					"mt-2.5 text-[14px] font-semibold",
					dark ? "text-white" : "text-ink-900"
				)}
			>
				{title}
			</p>
			<p className="mt-1 text-caption text-ink-500">{description}</p>
			{onRetry && (
				<Button
					size="sm"
					variant={dark ? "secondaryDark" : "secondary"}
					className="mt-3"
					onClick={onRetry}
				>
					다시 시도
				</Button>
			)}
		</div>
	);
}
