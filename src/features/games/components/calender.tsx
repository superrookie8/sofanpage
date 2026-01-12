import React, { useState, useEffect } from "react";
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
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
	const startDay = startOfMonth(currentMonth);
	const endDay = endOfMonth(currentMonth);
	const daysInCurrentMonth = eachDayOfInterval({
		start: startDay,
		end: endDay,
	});

	useEffect(() => {
		const fetchSchedules = async () => {
			try {
				// currentMonth를 기반으로 월의 시작일과 종료일 계산
				const monthStart = startOfMonth(currentMonth);
				const monthEnd = endOfMonth(currentMonth);

				// 현재 월의 시작일과 종료일 계산
				const start = new Date(
					monthStart.getFullYear(),
					monthStart.getMonth(),
					1
				);
				const end = new Date(
					monthEnd.getFullYear(),
					monthEnd.getMonth() + 1,
					0,
					23,
					59,
					59
				);

				// ISO 8601 형식으로 변환
				const startISO = start.toISOString();
				const endISO = end.toISOString();

				const response = await fetch(
					`/api/schedules?start=${startISO}&end=${endISO}`
				);

				// HTTP 응답 상태 확인
				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					console.error("API 응답 오류:", {
						status: response.status,
						statusText: response.statusText,
						error: errorData,
					});
					setSchedules([]);
					return;
				}

				const data = await response.json();

				// 응답 데이터 검증 및 로깅
				if (process.env.NODE_ENV === "development") {
					console.log("API 응답 데이터:", {
						isArray: Array.isArray(data),
						dataType: typeof data,
						dataLength: Array.isArray(data) ? data.length : "N/A",
						rawData: data,
					});
				}

				if (Array.isArray(data)) {
					// type이 "game"인 스케줄만 필터링
					const gameSchedules = data.filter(
						(schedule: ScheduleResponse) => schedule.type === "game"
					);

					if (process.env.NODE_ENV === "development") {
						console.log("필터링된 게임 스케줄:", {
							total: data.length,
							games: gameSchedules.length,
							schedules: gameSchedules,
						});
					} else {
						// 배포 환경에서도 최소한의 성공 로그 (문제 진단용)
						if (gameSchedules.length === 0 && data.length > 0) {
							console.warn("일정 데이터는 있지만 게임 스케줄이 없습니다:", {
								total: data.length,
								types: data.map((s: ScheduleResponse) => s.type),
							});
						}
					}

					setSchedules(gameSchedules);
				} else {
					console.error("응답이 배열이 아닙니다:", {
						dataType: typeof data,
						data: data,
					});
					setSchedules([]);
				}
			} catch (error) {
				console.error("일정 가져오기 실패:", error);
				setSchedules([]);
			}
		};

		fetchSchedules();
	}, [currentMonth]);

	const weekDayHeader = weekDays.map((day) => (
		<div key={day} className="text-center font-bold text-xs md:text-sm">
			{day}
		</div>
	));

	const prevMonth = () => {
		setCurrentMonth((prevState) => {
			const year = prevState.getFullYear();
			const month = prevState.getMonth();
			return new Date(year, month - 1, 1);
		});
	};

	const nextMonth = () => {
		setCurrentMonth((prevState) => {
			const year = prevState.getFullYear();
			const month = prevState.getMonth();
			return new Date(year, month + 1, 1);
		});
	};

	const emptyDays = Array(getDay(startDay)).fill(null);

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
		const formattedDate = format(date, "yyyy-MM-dd");
		const todaySchedules = schedules.filter((schedule) => {
			const scheduleDate = format(
				parseISO(schedule.startDateTime),
				"yyyy-MM-dd"
			);
			return scheduleDate === formattedDate;
		});

		return todaySchedules.map((schedule, index) => {
			// 시간 추출 (HH:mm 형식)
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
