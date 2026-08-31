import { cn } from "../cn";

export function Skeleton({ className }: { className?: string }) {
	return (
		<div
			aria-hidden
			className={cn(
				"rounded-sm bg-shimmer bg-[length:800px_100%] animate-shimmer",
				className
			)}
		/>
	);
}

/** 뉴스/일기 리스트용 카드 스켈레톤. */
export function CardSkeleton() {
	return (
		<div className="flex gap-3.5 rounded-md border border-ink-200 bg-white p-3">
			<Skeleton className="h-[74px] w-[110px] flex-shrink-0 rounded-[8px]" />
			<div className="flex flex-1 flex-col justify-center gap-2">
				<Skeleton className="h-3 w-14" />
				<Skeleton className="h-3.5 w-full" />
				<Skeleton className="h-3.5 w-[70%]" />
			</div>
		</div>
	);
}

export function CardSkeletonList({ count = 5 }: { count?: number }) {
	return (
		<div className="flex flex-col gap-2.5" aria-busy="true" aria-live="polite">
			<span className="sr-only">불러오는 중</span>
			{Array.from({ length: count }, (_, index) => (
				<CardSkeleton key={index} />
			))}
		</div>
	);
}
