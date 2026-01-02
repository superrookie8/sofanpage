import React, { useState, useEffect } from "react";
import { GameLocation } from "@/data/schedule";
import { locations, GameSchedule } from "@/data/schedule";
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	getDay,
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
}

const Calendar: React.FC<CalendarProps> = ({ onLocationSelect }) => {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [schedules, setSchedules] = useState<GameSchedule[]>([]);
	const startDay = startOfMonth(currentMonth);
	const endDay = endOfMonth(currentMonth);
	const daysInCurrentMonth = eachDayOfInterval({
		start: startDay,
		end: endDay,
	});

	useEffect(() => {
		const fetchSchedules = async () => {
			try {
				const response = await fetch("/api/getschedule");
				const data = await response.json();
				if (Array.isArray(data)) {
					setSchedules(data);
					console.log(data);
				} else {
					console.error("Fetched data is not an array:", data);
				}
			} catch (error) {
				console.error("Failed to fetch schedules:", error);
			}
		};

		fetchSchedules();
	}, []);

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

	const handleDateClick = (gameDate: string) => {
		const game = schedules.find((schedule) => schedule.date === gameDate);

		if (game) {
			const locationKey = game.isHome ? "부산 사직실내체육관" : game.opponent;
			const location = locations[locationKey.trim()];
			onLocationSelect(location);
		}
	};

	const renderGameSchedule = (date: Date) => {
		const formattedDate = format(date, "yyyy-MM-dd");
		const todaySchedules = schedules.filter(
			(schedule) => schedule.date === formattedDate
		);

		return todaySchedules.map((schedule, index) => (
			<div
				key={index}
				className={`mt-1 text-[10px] ${
					schedule.isHome ? "bg-red-200" : "bg-blue-200"
				} rounded p-1 overflow-y-auto cursor-pointer`}
				onClick={() => handleDateClick(schedule.date)}
			>
				<div>
					<span>{schedule.opponent}</span>

					<span>{` ${schedule.time}`}</span>
				</div>
				<div className="mt-2 screen-y-scroll">
					{schedule.specialGame ? <span>{schedule.specialGame}</span> : ""}
				</div>
			</div>
		));
	};

	return (
		<div className="w-full flex justify-center items-center">
			<div className="w-full max-w-[700px] flex flex-col justify-center items-center p-5">
				<div className="flex justify-between w-full mb-5">
					<button
						onClick={prevMonth}
						className="bg-transparent border-none text-xl font-semibold cursor-pointer"
					>
						{"<"}
					</button>
					<span className="text-xl font-semibold">
						{formatYearMonth(currentMonth)}
					</span>
					<button
						onClick={nextMonth}
						className="bg-transparent border-none text-xl font-semibold cursor-pointer"
					>
						{">"}
					</button>
				</div>
				<div className="grid grid-cols-7 gap-1 w-full">
					{weekDayHeader}
					{emptyDays.map((_, index) => (
						<div
							key={`empty-${index}`}
							className="bg-gray-200 h-20 md:h-24 lg:h-28"
						></div>
					))}
					{daysInCurrentMonth.map((day) => (
						<div
							key={day.toString()}
							className="bg-gray-200 flex flex-col p-1 h-20 md:h-24 lg:h-28"
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
