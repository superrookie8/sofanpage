"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GameLocation, ScheduleResponse } from "../types";
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	getDay,
	isSameDay,
	parseISO,
} from "date-fns";
import { useSchedulesByDateRangeQuery } from "../queries";
import { isGameSchedule } from "../nextGame";
import {
	isHomeGame,
	opponentName,
	resolveGameLocation,
} from "../scheduleView";
import { cn } from "@/shared/ui/cn";

// 월 이름을 한글로 반환하는 함수
const getKoreanMonth = (date: Date): string => {
	return new Intl.DateTimeFormat("ko-KR", { month: "long" }).format(date);
};

// 년도와 월을 문자열로 반환하는 함수
const formatYearMonth = (date: Date): string => {
	const year = date.getFullYear();
	const month = getKoreanMonth(date);
	return `${year}년 ${month}`;
};

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarProps {
	onLocationSelect: (location: GameLocation) => void;
	onGameClick?: (scheduleId: string) => void;
	/** false면 URL과 동기화하지 않음 (직관일지 작성 등 다른 페이지에서 사용 시) */
	syncUrl?: boolean;
	/** syncUrl이 true일 때 월 변경 시 반영할 경로 (기본: /schedule) */
	urlPath?: string;
	/**
	 * 처음 보여줄 달. 시즌을 고르면 그 시즌의 첫 경기 달에서 시작하도록 넘긴다.
	 * URL에 year·month가 있으면 그쪽이 우선한다.
	 */
	initialMonth?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
	onLocationSelect,
	onGameClick,
	syncUrl = true,
	urlPath = "/schedule",
	initialMonth: requestedMonth,
}) => {
	const searchParams = useSearchParams();
	const router = useRouter();

	// URL에서 year, month 읽기 (없으면 현재 날짜 사용)
	const yearParam = searchParams.get("year");
	const monthParam = searchParams.get("month");

	const requestedMonthKey = requestedMonth
		? `${requestedMonth.getFullYear()}-${requestedMonth.getMonth()}`
		: null;

	const initialMonth = useMemo(() => {
		if (!syncUrl) {
			return requestedMonthKey
				? new Date(
						Number(requestedMonthKey.split("-")[0]),
						Number(requestedMonthKey.split("-")[1]),
						1
				  )
				: new Date();
		}
		if (yearParam && monthParam) {
			const year = parseInt(yearParam);
			const month = parseInt(monthParam) - 1; // 0-based (1월 = 0)
			if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
				return new Date(year, month, 1);
			}
		}
		// URL에 없으면 호출한 쪽이 지정한 달, 그것도 없으면 현재 날짜
		if (requestedMonthKey) {
			const [year, month] = requestedMonthKey.split("-").map(Number);
			return new Date(year, month, 1);
		}
		return new Date();
	}, [yearParam, monthParam, syncUrl, requestedMonthKey]);

	const [currentMonth, setCurrentMonth] = useState(initialMonth);
	const isUpdatingFromURL = useRef(false);
	const lastUpdatedMonth = useRef<string | null>(null);

	// URL과 동기화 (URL이 변경되면 달력도 업데이트)
	useEffect(() => {
		const monthKey = `${initialMonth.getFullYear()}-${initialMonth.getMonth()}`;
		if (lastUpdatedMonth.current !== monthKey) {
			isUpdatingFromURL.current = true;
			setCurrentMonth(initialMonth);
			lastUpdatedMonth.current = monthKey;
			// 다음 렌더 사이클에서 false로 설정
			setTimeout(() => {
				isUpdatingFromURL.current = false;
			}, 0);
		}
	}, [initialMonth]);

	// currentMonth가 변경될 때 URL 업데이트 (URL에서 온 변경은 제외)
	useEffect(() => {
		if (!syncUrl || isUpdatingFromURL.current) {
			return;
		}

		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth() + 1; // 1-based (1월 = 1)
		const currentYear = yearParam ? parseInt(yearParam) : null;
		const currentMonthParam = monthParam ? parseInt(monthParam) : null;

		// URL과 다를 때만 업데이트
		if (currentYear !== year || currentMonthParam !== month) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("year", year.toString());
			params.set("month", month.toString());
			router.replace(`${urlPath}?${params.toString()}`, { scroll: false });
		}
	}, [
		currentMonth,
		yearParam,
		monthParam,
		searchParams,
		router,
		syncUrl,
		urlPath,
	]);

	// useMemo로 날짜 범위 계산
	const { daysInCurrentMonth, emptyDays, startISO, endISO } = useMemo(() => {
		const start = startOfMonth(currentMonth);
		const end = endOfMonth(currentMonth);

		const startDate = new Date(
			start.getFullYear(),
			start.getMonth(),
			1,
			0,
			0,
			0,
			0
		);
		const endDate = new Date(
			end.getFullYear(),
			end.getMonth() + 1,
			0,
			23,
			59,
			59,
			999
		);

		return {
			daysInCurrentMonth: eachDayOfInterval({
				start: start,
				end: end,
			}),
			emptyDays: Array(getDay(start)).fill(null),
			startISO: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
			endISO: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
		};
	}, [currentMonth]);

	// React Query로 데이터 가져오기
	const { data: allSchedules = [] } = useSchedulesByDateRangeQuery(
		startISO,
		endISO
	);

	// type이 "game" 또는 "specialGame"인 스케줄만 필터링
	const schedules: ScheduleResponse[] = useMemo(() => {
		return allSchedules.filter(isGameSchedule);
	}, [allSchedules]);

	const weekDayHeader = weekDays.map((day, index) => (
		<div
			key={day}
			className={cn(
				"pb-2 text-center text-stat-label",
				index === 0 ? "text-brand-700" : "text-ink-500"
			)}
		>
			{day}
		</div>
	));

	const prevMonth = () => {
		setCurrentMonth((prevState) => {
			return new Date(prevState.getFullYear(), prevState.getMonth() - 1, 1);
		});
	};

	const nextMonth = () => {
		setCurrentMonth((prevState) => {
			return new Date(prevState.getFullYear(), prevState.getMonth() + 1, 1);
		});
	};

	const handleDateClick = (schedule: ScheduleResponse) => {
		const location = resolveGameLocation(schedule);
		if (location) onLocationSelect(location);

		if (onGameClick) {
			// scheduleId를 전달
			onGameClick(schedule.id);
		}
	};

	const renderGameSchedule = (date: Date) => {
		// 로컬 시간대 기준으로 날짜 포맷 (yyyy-MM-dd)
		const formattedDate = format(date, "yyyy-MM-dd");
		const todaySchedules = schedules.filter((schedule) => {
			try {
				// 백엔드에서 받은 데이터를 그대로 파싱
				const scheduleDateObj = parseISO(schedule.startDateTime);
				const scheduleDate = format(scheduleDateObj, "yyyy-MM-dd");
				return scheduleDate === formattedDate;
			} catch (error) {
				return false;
			}
		});

		return todaySchedules.map((schedule: ScheduleResponse, index: number) => {
			// 시간 추출 (HH:mm 형식) - 백엔드 데이터를 그대로 파싱
			const time = format(parseISO(schedule.startDateTime), "HH:mm");
			const isHome = isHomeGame(schedule);

			return (
				<button
					key={schedule.id || index}
					type="button"
					onClick={() => handleDateClick(schedule)}
					title={`${opponentName(schedule)} ${time} ${isHome ? "홈" : "원정"}`}
					className={cn(
						"mt-1 w-full rounded-sm border px-1 py-0.5 text-left transition-colors",
						isHome
							? "border-brand-200 bg-brand-50 hover:bg-brand-100"
							: "border-ink-200 bg-ink-50 hover:bg-ink-100"
					)}
				>
					<span
						className={cn(
							"block truncate text-[10px] font-bold leading-tight lg:text-[11px]",
							isHome ? "text-brand-700" : "text-ink-700"
						)}
					>
						{opponentName(schedule)}
					</span>
					<span
						data-numeric
						className="block text-[9px] leading-tight text-ink-500 lg:text-[10px]"
					>
						{time} · {isHome ? "홈" : "원정"}
					</span>
				</button>
			);
		});
	};

	const today = new Date();

	return (
		<div className="w-full">
			{/* 월 네비게이션 */}
			<div className="mb-4 flex items-center justify-between gap-2">
				<button
					onClick={prevMonth}
					aria-label="이전 달"
					className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50"
				>
					‹
				</button>
				<h3 className="text-h2 lg:text-h2-lg" aria-live="polite">
					{formatYearMonth(currentMonth)}
				</h3>
				<button
					onClick={nextMonth}
					aria-label="다음 달"
					className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50"
				>
					›
				</button>
			</div>

			{/* 7열 그리드. 이전에는 셀이 220px 고정이라 컨테이너를 넘쳐 잘렸다. */}
			<div className="grid grid-cols-7 gap-1 lg:gap-1.5">
				{weekDayHeader}

				{emptyDays.map((_, index) => (
					<div key={`empty-${index}`} aria-hidden />
				))}

				{daysInCurrentMonth.map((day) => {
					const isToday = isSameDay(day, today);
					const isSunday = getDay(day) === 0;

					return (
						<div
							key={day.toString()}
							className={cn(
								"flex min-h-[68px] flex-col rounded-[10px] border bg-white p-1 sm:min-h-[84px] lg:min-h-[104px] lg:p-1.5",
								isToday ? "border-brand-500" : "border-ink-200"
							)}
						>
							<span
								className={cn(
									"mb-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold lg:text-[12px]",
									isToday
										? "bg-brand-500 text-white"
										: isSunday
										? "text-brand-700"
										: "text-ink-700"
								)}
							>
								{format(day, "d")}
							</span>
							<div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
								{renderGameSchedule(day)}
							</div>
						</div>
					);
				})}
			</div>

			{/* 범례 — 색만으로 구분하지 않도록 라벨을 함께 둔다 */}
			<div className="mt-4 flex items-center gap-4 text-caption text-ink-500">
				<span className="flex items-center gap-1.5">
					<span className="h-3 w-3 rounded-sm border border-brand-200 bg-brand-50" />
					홈 경기
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-3 w-3 rounded-sm border border-ink-200 bg-ink-50" />
					원정 경기
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-3 w-3 rounded-full bg-brand-500" />
					오늘
				</span>
			</div>
		</div>
	);
};

export default Calendar;
