// components/Calendar.tsx
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { selectedLocationState } from "@/states/locationState";
import { schedules, locations } from "@/data/schedule";
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	getDay,
	addDays,
} from "date-fns";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar: React.FC = () => {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const setSelectedLocation = useSetRecoilState(selectedLocationState);
	const startDay = startOfMonth(currentMonth);
	const endDay = endOfMonth(currentMonth);
	const daysInCurrentMonth = eachDayOfInterval({
		start: startDay,
		end: endDay,
	});

	// 요일 헤더 추가
	const weekDayHeader = weekDays.map((day) => (
		<div key={day} className="text-center font-bold">
			{day}
		</div>
	));

	const previousMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		);
	};

	const nextMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		);
	};

	// 달력 그리드 시작 전 빈 칸 계산
	const emptyDays = Array(getDay(startDay)).fill(null);

	// Calendar 컴포넌트 내부
	const handleDateClick = (gameDate: string) => {
		// 날짜에 해당하는 게임 스케줄 찾기
		const game = schedules.find((schedule) => schedule.date === gameDate);

		if (game) {
			// 게임의 위치 정보 찾기
			const locationKey = game.isHome ? "부산 사직실내체육관" : game.opponent;
			const location = locations[locationKey.trim()];

			// Recoil 상태 업데이트 함수 호출
			setSelectedLocation(location); // 이 함수는 useSetRecoilState를 사용해 정의
		}
	};

	// Map 컴포넌트에서 지도 업데이트 로직은 기존과 동일하게 유지

	// 경기 정보를 렌더링 하는 함수
	const renderGameSchedule = (date: Date) => {
		const formattedDate = format(date, "yyyy-MM-dd");
		const todaySchedules = schedules.filter(
			(schedule) => schedule.date === formattedDate
		);
		console.log(formattedDate, "날짜");
		console.log(todaySchedules, "오늘꺼");
		return todaySchedules.map((schedule, index) => (
			<div
				key={index}
				className={`mt-2 text-us ${
					schedule.isHome ? "bg-red-200" : "bg-blue-200"
				}`}
			>
				<span
					className="cursor-pointer"
					onClick={() => handleDateClick(schedule.date)}
				>
					{schedule.opponent}
				</span>
				<span>{` ${schedule.time}`}</span>
			</div>
		));
	};

	return (
		<div className="w-[700px] flex flex-col items-center p-5">
			{/* Month navigation */}
			<div className="flex justify-between w-full mb-5">
				<button onClick={previousMonth} className="text-xl font-semibold">
					{"<"}
				</button>
				<span>{format(currentMonth, "MMMM yyyy")}</span>
				<button onClick={nextMonth} className="text-xl font-semibold">
					{">"}
				</button>
			</div>
			{/* Weekdays */}
			<div className="grid grid-cols-7 gap-1 w-full">
				{weekDayHeader}
				{emptyDays.map((_, index) => (
					<div key={`empty-${index}`} className="bg-gray-200 h-20"></div>
				))}
				{daysInCurrentMonth.map((day) => (
					<div
						key={day.toString()}
						className="bg-gray-200 h-20 flex flex-col p-1"
					>
						<span className="text-sm">{format(day, "d")}</span>
						{/*  이벤트 데이터. */}
						{renderGameSchedule(day)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Calendar;
