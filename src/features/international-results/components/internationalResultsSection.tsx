"use client";

import { useEffect, useMemo, useReducer } from "react";
import Button from "@/shared/ui/primitives/button";
import SegmentedTabs from "@/shared/ui/primitives/segmentedTabs";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/primitives/states";
import { useInternationalResultsQuery } from "../queries";
import {
	type InternationalResultFilter,
	clampInternationalResultsPage,
	INTERNATIONAL_RESULTS_PAGE_SIZE,
	internationalResultsViewReducer,
	paginateInternationalResults,
	visibleInternationalResults,
} from "../presentation";
import InternationalResultCard from "./internationalResultCard";

const FILTERS = [
	{ value: "ALL", label: "전체" },
	{ value: "NATIONAL_TEAM", label: "국가대표" },
	{ value: "CLUB", label: "구단" },
	{ value: "EXHIBITION", label: "평가전" },
] as const;

export default function InternationalResultsSection() {
	const [view, dispatch] = useReducer(internationalResultsViewReducer, {
		filter: "ALL" as InternationalResultFilter,
		page: 1,
	});
	const { data, isLoading, isError, refetch } = useInternationalResultsQuery();
	const results = useMemo(
		() => visibleInternationalResults(data ?? [], view.filter),
		[data, view.filter]
	);
	const totalPages = Math.ceil(results.length / INTERNATIONAL_RESULTS_PAGE_SIZE);
	const currentPage = clampInternationalResultsPage(view.page, totalPages);
	const pageResults = useMemo(
		() => paginateInternationalResults(results, currentPage),
		[results, currentPage]
	);

	useEffect(() => {
		if (view.page !== currentPage) {
			dispatch({ type: "PAGE", page: currentPage });
		}
	}, [currentPage, view.page]);

	if (isLoading) {
		return (
			<div className="grid gap-3 md:grid-cols-2">
				{Array.from({ length: 4 }, (_, index) => (
					<Skeleton key={index} className="h-64 rounded-md" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<ErrorState
				title="국제대회 기록을 불러오지 못했어요"
				description="다른 홈 콘텐츠는 정상적으로 이용할 수 있어요"
				onRetry={() => refetch()}
			/>
		);
	}

	const hasPublishedResults = (data ?? []).some((result) => result.published);
	if (!hasPublishedResults) {
		return (
			<EmptyState
				illustration="white"
				title="등록된 국제대회 기록이 없어요"
				description="공식 기록을 확인한 뒤 업데이트할게요"
			/>
		);
	}

	return (
		<div>
			<div className="mb-4 overflow-x-auto pb-1">
				<SegmentedTabs
					aria-label="국제대회 종류"
					value={view.filter}
					onChange={(filter) => dispatch({ type: "FILTER", filter })}
					options={FILTERS}
					className="min-w-max"
				/>
			</div>

			{results.length === 0 ? (
				<EmptyState
					title="이 종류의 기록은 아직 없어요"
					description="다른 종류를 선택해 확인해보세요"
				/>
			) : (
				<>
					<div className="grid gap-3 md:grid-cols-2">
						{pageResults.map((result) => (
							<InternationalResultCard key={result.id} result={result} />
						))}
					</div>

					{totalPages > 1 && (
						<nav
							aria-label="국제대회 기록 페이지"
							className="mt-5 flex items-center justify-center gap-3"
						>
							<Button
								variant="secondary"
								size="sm"
								aria-label="이전 국제대회 기록 페이지"
								disabled={currentPage === 1}
								onClick={() =>
									dispatch({ type: "PAGE", page: currentPage - 1 })
								}
							>
								이전
							</Button>
							<p className="min-w-16 text-center text-sm font-semibold tabular-nums text-ink-700">
								<span className="sr-only">현재 페이지 </span>
								{currentPage} / {totalPages}
							</p>
							<Button
								variant="secondary"
								size="sm"
								aria-label="다음 국제대회 기록 페이지"
								disabled={currentPage === totalPages}
								onClick={() =>
									dispatch({ type: "PAGE", page: currentPage + 1 })
								}
							>
								다음
							</Button>
						</nav>
					)}
				</>
			)}
		</div>
	);
}
