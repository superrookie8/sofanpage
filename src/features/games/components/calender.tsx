import React, { useState, useEffect, useMemo } from "react";
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
	
	// useMemo로 불필요한 재계산 방지
	const { startDay, endDay, daysInCurrentMonth, emptyDays } = useMemo(() => {
		const start = startOfMonth(currentMonth);
		const end = endOfMonth(currentMonth);
		return {
			startDay: start,
			endDay: end,
			daysInCurrentMonth: eachDayOfInterval({
				start: start,
				end: end,
			}),
			emptyDays: Array(getDay(start)).fill(null),
		};
	}, [currentMonth]);

	// schedules 상태 변경 감지용 디버깅
	useEffect(() => {
		console.log("[캘린더] schedules 상태 변경:", {
			count: schedules.length,
			scheduleIds: schedules.map((s) => s.id),
		});
	}, [schedules]);

	useEffect(() => {
		const fetchSchedules = async () => {
			try {
				// currentMonth를 기반으로 월의 시작일과 종료일 계산
				const monthStart = startOfMonth(currentMonth);
				const monthEnd = endOfMonth(currentMonth);

				// 한국 시간대(KST, UTC+9) 기준으로 날짜 범위 계산
				// 로컬 시간대로 날짜를 생성
				const start = new Date(
					monthStart.getFullYear(),
					monthStart.getMonth(),
					1,
					0,
					0,
					0,
					0
				);
				const end = new Date(
					monthEnd.getFullYear(),
					monthEnd.getMonth() + 1,
					0,
					23,
					59,
					59,
					999
				);

				// ISO 8601 형식으로 변환 (toISOString()은 자동으로 UTC로 변환)
				// 예: 2026-02-01 00:00:00 KST → 2026-01-31 15:00:00.000Z
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

				// 응답 데이터 검증 및 로깅 (배포 환경에서도 최소한의 로그)
				console.log("[캘린더] API 응답 데이터:", {
					isArray: Array.isArray(data),
					dataType: typeof data,
					dataLength: Array.isArray(data) ? data.length : "N/A",
					startISO,
					endISO,
					localStart: start.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
					localEnd: end.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
				});

				if (Array.isArray(data)) {
					// type이 "game"인 스케줄만 필터링
					const gameSchedules = data.filter(
						(schedule: ScheduleResponse) => schedule.type === "game"
					);

					console.log("[캘린더] 필터링된 게임 스케줄:", {
						total: data.length,
						games: gameSchedules.length,
						scheduleIds: gameSchedules.map((s) => s.id),
					});

					// 상태 업데이트 전 로그
					console.log("[캘린더] 상태 업데이트 전 schedules 개수:", schedules.length);
					
					setSchedules(gameSchedules);
					
					// 상태 업데이트는 비동기이므로, 다음 렌더에서 확인
					setTimeout(() => {
						console.log("[캘린더] 상태 업데이트 완료, 예상 개수:", gameSchedules.length);
					}, 0);
				} else {
					console.error("[캘린더] 응답이 배열이 아닙니다:", {
						dataType: typeof data,
						data: data,
					});
					setSchedules([]);
				}
			} catch (error) {
				console.error("[캘린더] 일정 가져오기 실패:", error);
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
				// ISO 문자열을 파싱 (타임존 정보 포함)
				const scheduleDateObj = parseISO(schedule.startDateTime);
				// 로컬 시간대 기준으로 날짜 포맷하여 비교
				const scheduleDate = format(scheduleDateObj, "yyyy-MM-dd");
				const matches = scheduleDate === formattedDate;
				
				// 디버깅: 날짜 매칭 실패 시 로그 출력
				if (!matches && scheduleDateObj.getTime() >= date.getTime() - 86400000 && scheduleDateObj.getTime() <= date.getTime() + 86400000) {
					console.log("[캘린더] 날짜 매칭 실패 (근접한 날짜):", {
						calendarDate: formattedDate,
						scheduleDate,
						scheduleISO: schedule.startDateTime,
						scheduleLocal: scheduleDateObj.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
					});
				}
				
				return matches;
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
