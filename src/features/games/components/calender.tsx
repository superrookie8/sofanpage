import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GameLocation, ScheduleResponse } from "../types";
import { locations } from "../constants";
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	getDay,
	parseISO,
} from "date-fns";
import { useSchedulesByDateRangeQuery } from "../queries";

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
}

const Calendar: React.FC<CalendarProps> = ({
	onLocationSelect,
	onGameClick,
}) => {
	const searchParams = useSearchParams();
	const router = useRouter();

	// URL에서 year, month 읽기 (없으면 현재 날짜 사용)
	const yearParam = searchParams.get("year");
	const monthParam = searchParams.get("month");

	const initialMonth = useMemo(() => {
		if (yearParam && monthParam) {
			const year = parseInt(yearParam);
			const month = parseInt(monthParam) - 1; // 0-based (1월 = 0)
			if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
				return new Date(year, month, 1);
			}
		}
		return new Date(); // URL에 없으면 현재 날짜
	}, [yearParam, monthParam]);

	const [currentMonth, setCurrentMonth] = useState(initialMonth);
	const isUpdatingFromURL = useRef(false);

	// URL과 동기화 (URL이 변경되면 달력도 업데이트)
	useEffect(() => {
		isUpdatingFromURL.current = true;
		setCurrentMonth(initialMonth);
		isUpdatingFromURL.current = false;
	}, [initialMonth]);

	// currentMonth가 변경될 때 URL 업데이트 (URL에서 온 변경은 제외)
	useEffect(() => {
		if (isUpdatingFromURL.current) {
			return; // URL에서 온 변경이면 URL 업데이트 안 함
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
			router.push(`/schedule?${params.toString()}`, { scroll: false });
		}
	}, [currentMonth, yearParam, monthParam, searchParams, router]);

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

	// type이 "game"인 스케줄만 필터링
	const schedules = useMemo(() => {
		return allSchedules.filter(
			(schedule: ScheduleResponse) => schedule.type === "game"
		);
	}, [allSchedules]);

	const weekDayHeader = weekDays.map((day) => (
		<div key={day} className="text-center font-bold text-xs md:text-sm">
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
		const isHome = schedule.location === "Home";

		if (isHome) {
			const location = locations["부산 사직실내체육관"];
			onLocationSelect(location);
		} else if (schedule.opponent) {
			const location = locations[schedule.opponent.trim()];
			if (location) {
				onLocationSelect(location);
			}
		}

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
				console.error("[캘린더] 날짜 파싱 오류:", {
					startDateTime: schedule.startDateTime,
					error,
				});
				return false;
			}
		});

		if (todaySchedules.length > 0) {
			console.log(`[캘린더] ${formattedDate} 일정 렌더링:`, {
				count: todaySchedules.length,
				schedules: todaySchedules.map((s) => ({
					id: s.id,
					title: s.title,
					time: s.startDateTime,
				})),
			});
		}

		return todaySchedules.map((schedule, index) => {
			// 시간 추출 (HH:mm 형식) - 백엔드 데이터를 그대로 파싱
			const time = format(parseISO(schedule.startDateTime), "HH:mm");
			const isHome = schedule.location === "Home";

			return (
				<div
					key={schedule.id || index}
					className={`mt-1 text-[10px] ${
						isHome ? "bg-red-200" : "bg-blue-200"
					} rounded p-1 overflow-y-auto cursor-pointer`}
					onClick={() => handleDateClick(schedule)}
				>
					<div>
						<span>
							vs {schedule.title} {time}
						</span>
					</div>
				</div>
			);
		});
	};

	return (
		<div className="w-full flex justify-center items-start overflow-hidden ">
			<div className="w-full max-w-[1600px] flex flex-col justify-center items-start p-5 rounded-lg">
				<div className="flex justify-between items-center w-full mb-5 h-12">
					<button
						onClick={prevMonth}
						className="w-[80px] md:w-[100px] h-12 bg-transparent border border-gray-200 rounded-lg p-2 text-xl font-semibold cursor-pointer hover:bg-gray-200"
					>
						{"<"}
					</button>
					<span className="text-xl font-semibold h-12 flex items-center justify-center">
						{formatYearMonth(currentMonth)}
					</span>
					<button
						onClick={nextMonth}
						className="w-[80px] md:w-[100px] h-12 bg-transparent border border-gray-200 rounded-lg p-2 text-xl font-semibold cursor-pointer hover:bg-gray-200"
					>
						{">"}
					</button>
				</div>
				<div className="grid gap-1 w-fit min-h-[500px] md:min-h-[600px] lg:min-h-[700px] grid-cols-7">
					{weekDayHeader}
					{emptyDays.map((_, index) => (
						<div
							key={`empty-${index}`}
							className="bg-white min-w-[40px] w-[220px] border border-gray-200 rounded-lg h-20 md:h-24 lg:h-28"
						></div>
					))}
					{daysInCurrentMonth.map((day) => (
						<div
							key={day.toString()}
							className="bg-white min-w-[40px] w-[220px] border border-gray-200 rounded-lg flex flex-col p-1 h-20 md:h-24 lg:h-28"
						>
							<span className="text-xs md:text-sm">{format(day, "d")}</span>
							{renderGameSchedule(day)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Calendar;
