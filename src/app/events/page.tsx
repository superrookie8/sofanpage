"use client";
import Image from "next/image";
import { useState } from "react";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/primitives/states";
import {
	useEventDetailQuery,
	useEventListQuery,
} from "@/features/events/queries";
import type { EventDetails } from "@/features/events/types";
import { cn } from "@/shared/ui/cn";

function EventContent({ event }: { event: EventDetails }) {
	const checks = event.checkFields
		? [
				event.checkFields.check1,
				event.checkFields.check2,
				event.checkFields.check3,
		  ].filter((value): value is string => Boolean(value))
		: [];
	const externalUrl = event.url?.startsWith("http") ?? false;

	return (
		<div className="border-t border-ink-700 p-4 lg:p-5">
			<p className="whitespace-pre-line text-sm-lg leading-relaxed text-ink-200">
				{event.description || "등록된 이벤트 설명이 없습니다."}
			</p>

			{checks.length > 0 && (
				<ul className="mt-4 space-y-2 text-[14px] text-ink-200">
					{checks.map((check) => (
						<li key={check} className="flex gap-2">
							<span aria-hidden className="text-brand-400">✓</span>
							<span>{check}</span>
						</li>
					))}
				</ul>
			)}

			{event.url && (
				<a
					href={event.url}
					target={externalUrl ? "_blank" : undefined}
					rel={externalUrl ? "noreferrer" : undefined}
					className="mt-4 inline-flex min-h-11 items-center rounded-md bg-brand-500 px-4 text-[14px] font-bold text-white hover:bg-brand-600"
				>
					이벤트 링크 열기
				</a>
			)}

			<section className="mt-6" aria-label={`${event.title} 사진`}>
				<h3 className="mb-3 text-[15px] font-bold text-white">사진</h3>
				{event.photos.length === 0 ? (
					<p className="rounded-md border border-ink-700 bg-ink-900/40 p-4 text-[14px] text-ink-300">
						등록된 이벤트 사진이 없습니다.
					</p>
				) : (
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{event.photos.map((photo, index) => (
							<div
								key={photo}
								className="relative aspect-square overflow-hidden rounded-md bg-ink-900"
							>
								<Image
									src={photo}
									alt={`${event.title} 사진 ${index + 1}`}
									fill
									sizes="(max-width: 640px) 50vw, 320px"
									className="object-cover"
								/>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}

export default function EventsPage() {
	const [activeEventId, setActiveEventId] = useState<string | null>(null);
	const { data: events = [], isLoading, isError, refetch } = useEventListQuery();
	const eventDetails = useEventDetailQuery(
		activeEventId ?? "",
		activeEventId !== null
	);

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
						<Skeleton key={index} className="h-[180px] rounded-lg" />
					))}
				</div>
			) : isError ? (
				<ErrorState dark onRetry={() => refetch()} />
			) : events.length === 0 ? (
				<EmptyState dark illustration="red" title="공개된 이벤트가 없어요" />
			) : (
				<div className="grid items-start gap-4 md:grid-cols-2">
					{events.map((event) => {
						const expanded = activeEventId === event.id;
						return (
							<article
								key={event.id}
								className="overflow-hidden rounded-lg border border-ink-700 bg-surface-dark"
							>
								<button
									type="button"
									aria-expanded={expanded}
									aria-controls={`event-${event.id}`}
									onClick={() =>
										setActiveEventId(expanded ? null : event.id)
									}
									className={cn(
										"flex min-h-[88px] w-full items-center justify-between gap-4 p-4 text-left transition-colors",
										expanded ? "bg-ink-800" : "hover:bg-ink-800/70"
									)}
								>
									<h2 className="text-h3-lg text-white">{event.title}</h2>
									<span aria-hidden className="text-[22px] text-brand-400">
										{expanded ? "−" : "+"}
									</span>
								</button>

								{expanded && (
									<div id={`event-${event.id}`}>
										{eventDetails.isLoading ? (
											<div className="space-y-3 border-t border-ink-700 p-4">
												<Skeleton className="h-16 rounded-md" />
												<Skeleton className="h-36 rounded-md" />
											</div>
										) : eventDetails.isError ? (
											<div className="border-t border-ink-700 p-4">
												<ErrorState dark onRetry={() => eventDetails.refetch()} />
											</div>
										) : eventDetails.data ? (
											<EventContent event={eventDetails.data} />
										) : null}
									</div>
								)}
							</article>
						);
					})}
				</div>
			)}
		</div>
	);
}
