"use client";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/primitives/states";
import { useEventListQuery } from "@/features/events/queries";
import { cn } from "@/shared/ui/cn";

/** 제목의 "N주년"으로 전용 상세 페이지 경로를 만든다. (/events/5th 등) */
function eventHref(title: string) {
	const match = title.match(/(\d+)주년/);
	return match ? `/events/${match[1]}th` : null;
}

/** 주년별 대표 이미지. 없으면 기본 포스터를 쓴다. */
function eventImage(title: string) {
	if (title.includes("6주년")) return "/images/soheeposter34.png";
	if (title.includes("5주년")) return "/images/banner2.png";
	return "/images/banner.png";
}

export default function EventsPage() {
	const { data: events = [], isLoading, isError, refetch } = useEventListQuery();

	return (
		<div>
			<PageHeader
				dark
				eyebrow="FAN EVENTS"
				title="이벤트"
				description="팬들이 함께 만든 기록"
			/>

			{isLoading ? (
				<div className="grid gap-4 md:grid-cols-2">
					{Array.from({ length: 2 }, (_, index) => (
						<Skeleton key={index} className="h-[300px] rounded-lg" />
					))}
				</div>
			) : isError ? (
				<ErrorState dark onRetry={() => refetch()} />
			) : events.length === 0 ? (
				<EmptyState dark illustration="red" title="공개된 이벤트가 없어요" />
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{events.map((event) => {
						const href = eventHref(event.title);
						const ongoing = event.title.includes("진행");

						const card = (
							<article
								className={cn(
									"overflow-hidden rounded-lg border border-ink-700 bg-surface-dark transition-[transform,box-shadow] duration-150",
									href &&
										"hover:-translate-y-0.5 hover:shadow-raised motion-reduce:hover:translate-y-0"
								)}
							>
								<div className="relative h-[200px] w-full bg-ink-900 lg:h-[220px]">
									<Image
										src={eventImage(event.title)}
										alt=""
										fill
										sizes="(max-width: 768px) 100vw, 520px"
										className={cn(
											"object-cover",
											!ongoing && "grayscale-[35%]"
										)}
									/>
									<span
										className={cn(
											"absolute left-4 top-4 inline-flex h-7 items-center rounded-full px-3 text-[12px] font-bold",
											ongoing
												? "bg-brand-500 text-white"
												: "bg-white/[.16] text-white"
										)}
									>
										{ongoing ? "진행중" : "종료"}
									</span>
								</div>
								<div className="p-4">
									<h2 className="text-h3-lg text-white">{event.title}</h2>
									{href && (
										<p className="mt-1.5 text-[13px] text-ink-300">
											이벤트 사이트 보기 →
										</p>
									)}
								</div>
							</article>
						);

						return href ? (
							<Link key={event.id} href={href} className="block">
								{card}
							</Link>
						) : (
							<div key={event.id}>{card}</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
