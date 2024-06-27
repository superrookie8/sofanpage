import React, { useState, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { selectedLocationState } from "@/states/locationState";
import { locations, GameSchedule } from "@/data/schedule";
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	getDay,
} from "date-fns";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar: React.FC = () => {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [schedules, setSchedules] = useState<GameSchedule[]>([]);
	const setSelectedLocation = useSetRecoilState(selectedLocationState);
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
				// 반환된 데이터가 배열인지 확인
				if (Array.isArray(data)) {
					setSchedules(data);
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

	const emptyDays = Array(getDay(startDay)).fill(null);

	const handleDateClick = (gameDate: string) => {
		const game = schedules.find((schedule) => schedule.date === gameDate);

		if (game) {
			const locationKey = game.isHome ? "부산 사직실내체육관" : game.opponent;
			const location = locations[locationKey.trim()];
			setSelectedLocation(location);
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
			<div className="flex justify-between w-full mb-5">
				<button onClick={previousMonth} className="text-xl font-semibold">
					{"<"}
				</button>
				<span>{format(currentMonth, "MMMM yyyy")}</span>
				<button onClick={nextMonth} className="text-xl font-semibold">
					{">"}
				</button>
			</div>
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
						{renderGameSchedule(day)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Calendar;
