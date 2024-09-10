"use client";
import DiaryPhotoUpload from "@/components/diaryPhotoUpload";
import React, { FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import WeatherToggleMenu from "@/components/weatherMenu";
import SelectedWeather from "@/components/selectedWeather";
import SelectedTogether from "@/components/selectedWith";
import TogetherToggleMenu from "@/components/togetherToggle";

interface Props {}

const BasketballDiary: React.FC<Props> = (props) => {
	const [photo, setPhoto] = useState<string | null>(null);
	const [date, setDate] = useState<string>("");
	const [weather, setWeather] = useState<string>("");
	const [together, setTogether] = useState<string>("");

	const handlePhotoChange = (photoUrl: string) => {
		setPhoto(photoUrl);
	};

	useEffect(() => {
		const today = new Date();
		setDate(format(today, "yyyy-MM-dd"));
	}, []);

	const handleDateChange = (event: FormEvent<HTMLInputElement>) => {
		const selectedDate = new Date(event.currentTarget.value);
		setDate(format(selectedDate, "yyyy-MM-dd"));
	};

	return (
		<div className="flex flex-col md:flex-row lg:flex-row justify-center items-center w-full rounded">
			<div className="w-1/2 h-600 flex flex-col justify-center items-center">
				<div className="w-full h-20 bg-yellow-500 flex flex-row ">
					<div className="w-1/3 h-20 bg-green-300 flex flex-col justify-center items-center">
						<label htmlFor="datePicker" className="flex w-full flex ml-16">
							관람일자
						</label>
						<input
							type="date"
							id="datePicker"
							value={date}
							onChange={handleDateChange}
						/>
					</div>
					<div className="w-1/3 h-20 bg-gray-300 flex flex-col justify-center items-center">
						<label className="flex w-full ml-8 mt-2">날씨</label>
						<div className="w-full flex flex-row justify-center items-center mr-4">
							<div className="w-1/3 flex justify-center items-center">
								<WeatherToggleMenu onSelect={setWeather} />
							</div>

							<div className="w-2/3 flex justify-center">
								<SelectedWeather weather={weather} />
							</div>
						</div>
					</div>
					<div className="w-1/3 h-20 bg-green-300 flex flex-col justify-center items-center relative z-10">
						<label className="flex w-full flex mt-2 ml-16">함께본사람</label>
						<div className="w-full flex flex-row justify-center items-center gap-2">
						<div className="w-1/3 flex justify-center items-center ">
								<TogetherToggleMenu onSelect={setTogether}/>
							</div>
						<div className="w-2/3 flex justify-center items-center">
							<SelectedTogether together={together}/>
						</div>
						</div>
					</div>
				</div>
				<div className="w-full h-1/2 bg-black bg-opacity-75 flex flex-row">
					<div className="w-full h-full rounded-lg flex justify-center items-center cursor-pointer p-10">
						<DiaryPhotoUpload onDiaryPhotoUpload={handlePhotoChange} />
					</div>
				</div>
				<div className="w-full h-20 bg-black bg-opacity-75 rounded  ">
					<input
						className="w-full h-full rounded pl-4 focus:outline-none"
						placeholder="간단한 메시지"

					></input>
				</div>
				<div className="w-full h-[100px] flex justify-center items-center">
					<button className="border-2 rounded-lg w-[100px] h-[40px]">
						올리기
					</button>
				</div>
			</div>
			<div className="w-1/2 h-80 bg-blue-500 flex flex-col justify-center items-center">
				<div></div>
			</div>
		</div>
	);
};

export default BasketballDiary;
