"use client";
import DiaryPhotoUpload from "@/components/diaryPhotoUpload";
import React, { FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import WeatherToggleMenu from "@/components/weatherMenu";
import SelectedWeather from "@/components/selectedWeather";
import SelectedTogether from "@/components/selectedWith";
import TogetherToggleMenu from "@/components/togetherToggle";
import LocationToggleMenu from "@/components/locationToggle";
import SelectedLocation from "@/components/selectedLocation";
import WinningToggleMenu from "@/components/winningToggle";
import SelectedWinningMode from "@/components/selectedWinLose";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { DiaryPhotoPreviewState } from "@/states/diaryPhotoPreview";
import DiaryTabs from "@/components/diaryTabs";
import useAuth from "@/hooks/useAuth";

interface Props {}

const BasketballDiary: React.FC<Props> = (props) => {
	const [photo, setPhoto] = useState<string | null>(null);
	const [date, setDate] = useState<string>("");
	const [weather, setWeather] = useState<string>("");
	const [together, setTogether] = useState<string>("");
	const [location, setLocation] = useState<string>("");
	const [isWinning, setIsWinning] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [preview, setPreview] = useRecoilState(DiaryPhotoPreviewState);
	const user = useAuth();
	const router = useRouter(); // 페이지 이동을 위한 Router

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

	const onChangeMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(event.currentTarget.value);
	};
	// POST 데이터 전송 함수
	const postData = async (): Promise<void> => {
		if (!user) {
			alert("로그인 해주세요.");
			return;
		}
		// FormData 객체 생성
		const formData = new FormData();
		formData.append("name", user.nickname);
		formData.append("date", date); // 관람일자
		formData.append("weather", weather); // 날씨
		formData.append("location", location); // 장소
		formData.append("together", together); // 함께 본 사람
		formData.append("win_status", isWinning); // 승패 상태

		// 사진이 있는 경우
		if (photo) {
			const response = await fetch(photo);
			const blob = await response.blob();

			// 현재 시간이나 고유 ID 등을 사용해서 동적 파일명 생성
			const timestamp = new Date().toISOString();
			const fileName = `photo_${timestamp}.jpg`;

			const file = new File([blob], fileName, { type: blob.type });
			formData.append("diary_photo", file); // 사진 파일 추가
		}

		formData.append("message", message);

		Array.from(formData.entries()).forEach(([key, value]) => {
			console.log(`${key}:`, value);
		});
		try {
			// 백엔드로 데이터 전송
			const response = await fetch("/api/postdiary", {
				method: "POST",
				body: formData,
			});

			// 응답 처리
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to post diary entry.");
			}

			const responseData = await response.json();
			console.log(responseData);
			alert("Diary entry added successfully");

			// 성공 후 페이지 이동

			setPhoto("");
			setDate("default");
			setWeather("");
			setTogether("");
			setLocation("");
			setIsWinning("");
			setMessage("");
			setPreview([]);
			router.push(`/diary/create`);
		} catch (error) {
			console.error("Error posting diary entry:", error);
			alert("Error occurred while posting the diary entry.");
		}
	};
	return (
		<div className="mt-8 p-4 gap-4 flex flex-col md:flex-row lg:flex-row justify-center items-center w-full rounded">
			<div className="w-1/2 h-[700px] flex flex-col justify-center items-center">
				<div className="w-full h-20 gap-4  flex flex-row ">
					<div className="w-1/4 h-20 flex flex-col justify-center items-center border-2 border-red-500 rounded">
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
					<div className="w-1/8 h-20 border-2 border-red-500 rounded flex flex-col justify-center items-center ">
						<label className="flex w-full ml-8 mt-2">날씨</label>
						<div className="w-full flex flex-row justify-center items-center mr-4">
							<div className="w-1/3 flex justify-center items-center">
								<WeatherToggleMenu onSelect={setWeather} />
							</div>

							<div className="w-2/3 min-w-[70px]  flex justify-center">
								<SelectedWeather weather={weather} />
							</div>
						</div>
					</div>
					<div className="w-1/4 h-20 border-2 border-red-500 rounded flex flex-col justify-center items-center relative z-10">
						<label className="flex w-full flex mt-2 ml-16">장소</label>
						<div className="w-full flex flex-row justify-center items-center gap-2">
							<div className="w-1/3 flex justify-center items-center ">
								<LocationToggleMenu onSelect={setLocation} />
							</div>
							<div className="w-2/3 flex justify-center items-center">
								<SelectedLocation location={location} />
							</div>
						</div>
					</div>
					<div className="w-1/8 h-20 border-2 border-red-500 rounded flex flex-col justify-center items-center relative z-10">
						<label className="flex w-full flex mt-2 ml-16">함께 본 사람</label>
						<div className="w-full flex flex-row justify-center items-center gap-2">
							<div className="w-1/3 flex justify-center items-center ">
								<TogetherToggleMenu onSelect={setTogether} />
							</div>
							<div className="w-2/3 flex justify-center items-center">
								<SelectedTogether together={together} />
							</div>
						</div>
					</div>
					<div className="w-1/8 h-20 border-2 border-red-500 rounded flex flex-col justify-center items-center relative z-10">
						<label className="flex w-full flex mt-2 ml-16">승패선택</label>
						<div className="w-full flex flex-row justify-center items-center gap-2">
							<div className="w-1/3 flex justify-center items-center ">
								<WinningToggleMenu onSelect={setIsWinning} />
							</div>
							<div className="w-2/3 flex justify-center items-center">
								<SelectedWinningMode winningmode={isWinning} />
							</div>
						</div>
					</div>
				</div>
				<div className="w-full h-1/2 bg-black bg-opacity-75 flex flex-row">
					<div className="w-full h-full rounded-lg flex justify-center items-center cursor-pointer p-10">
						<DiaryPhotoUpload onDiaryPhotoUpload={handlePhotoChange} />
					</div>
				</div>
				<div className="w-full h-20 bg-black bg-opacity-75 rounded border-2 border-red-500 ">
					<textarea
						value={message}
						className="w-full h-full rounded p-4 focus:outline-none"
						placeholder="간단한 메시지"
						onChange={onChangeMessage}
					></textarea>
				</div>
				<div className="w-full h-[100px] flex justify-center items-center">
					<button
						className="border-2 rounded-lg w-[100px] h-[40px]"
						onClick={postData}
					>
						올리기
					</button>
				</div>
			</div>
			<div className="w-1/2 mb-24 h-[500px] bg-blue-500 flex flex-col justify-center items-center overflow-y-auto">
				<div>Live Game</div>
				<DiaryTabs />
			</div>
		</div>
	);
};

export default BasketballDiary;
