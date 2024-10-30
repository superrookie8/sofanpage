"use client";
import DiaryPhotoUpload from "@/components/diary/diaryPhotoUpload";
import React, { FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import WeatherToggleMenu from "@/components/diary/weatherMenu";
import SelectedWeather from "@/components/diary/selectedWeather";
import SelectedTogether from "@/components/diary/selectedWith";
import TogetherToggleMenu from "@/components/diary/togetherToggle";
import LocationToggleMenu from "@/components/diary/locationToggle";
import SelectedLocation from "@/components/diary/selectedLocation";
import WinningToggleMenu from "@/components/diary/winningToggle";
import SelectedWinningMode from "@/components/diary/selectedWinLose";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { DiaryPhotoPreviewState } from "@/states/diaryPhotoPreview";
import DiaryTabs from "@/components/diary/diaryTabs";
import useAuth from "@/hooks/useAuth";
import SectionToggleMenu from "@/components/diary/sectionToggleMenu";
import RowToggleMenu from "@/components/diary/rowToggleMenu";
import NumberToggleMenu from "@/components/diary/numberToggleMenu";
import SelectedSection from "@/components/diary/selectedSection";
import SelectedRow from "@/components/diary/selectedRow";
import SelectedNumber from "@/components/diary/selectedNumber";
import { locatonState } from "@/states/locationState";
import AlertModal from "@/components/shared/alertModal";
import { DiaryPhotoData } from "@/states/diaryPhotoPreview";

// Define DiaryPhotoData if it's not already defined

interface Props {}

const BasketballDiary: React.FC<Props> = (props) => {
	const [ticketphoto, setTicketPhoto] = useState<string | null>(null);
	const [viewphoto, setViewPhoto] = useState<string | null>(null);
	const [additionalphoto, setAdditionalPhoto] = useState<string | null>(null);
	const [date, setDate] = useState<string>("");
	const [weather, setWeather] = useState<string>("");
	const [together, setTogether] = useState<string>("");
	const [location, setLocation] = useRecoilState(locatonState);
	const [isWinning, setIsWinning] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [seatInfo, setSeatInfo] = useState({
		section: "",
		row: "",
		number: "",
	});
	const [preview, setPreview] = useRecoilState(DiaryPhotoPreviewState);

	const user = useAuth();
	const router = useRouter(); // 페이지 이동을 위한 Router

	const [isOpen, setIsOpen] = useState(false);
	const [modalMessage, setModalMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

	const handleOpenModal = (message: string) => {
		setModalMessage(message);
		setIsOpen(true);
	};

	const handleCloseModal = () => {
		setIsOpen(false);
		router.push("/diary/create");
		window.location.reload();
	};

	const handleDiaryPhotoChange = (
		photoUrl: string,
		type: "ticket" | "view" | "additional"
	) => {
		if (type === "ticket") {
			setTicketPhoto(photoUrl);
		} else if (type === "view") {
			setViewPhoto(photoUrl);
		} else if (type === "additional") {
			setAdditionalPhoto(photoUrl);
		}
		setPreview((prev) => [...prev, { url: photoUrl } as DiaryPhotoData]);
		console.log(`${type} photo updated:`, photoUrl);
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

	const updateSeatInfo = (key: string, value: string) => {
		setSeatInfo((prevState) => ({
			...prevState,
			[key]: value,
		}));
	};

	// POST 데이터 전송 함수
	const postData = async (): Promise<void> => {
		if (!user) {
			handleOpenModal("로그인 해주세요.");
			return;
		}

		console.log("Current ticket photo:", ticketphoto);
		console.log("Current view photo:", viewphoto);

		if (!ticketphoto || !viewphoto) {
			handleOpenModal("티켓 사진과 경기장 사진을 업로드해주세요.");
			return;
		}

		setIsLoading(true); // Start loading

		// FormData 객체 생성
		const formData = new FormData();
		formData.append("name", user.nickname);
		formData.append("date", date); // 관람일자
		formData.append("weather", weather); // 날씨
		formData.append("location", location); // 장소
		formData.append("together", together); // 함께 본 사람
		formData.append("win_status", isWinning); // 승패 상태

		// 좌석 정보 추가
		formData.append("section", seatInfo.section);
		formData.append("row", seatInfo.row);
		formData.append("number", seatInfo.number);

		// 티켓 사진 추가
		const ticketResponse = await fetch(ticketphoto);
		const ticketBlob = await ticketResponse.blob();
		const ticketFile = new File(
			[ticketBlob],
			`ticket_${new Date().toISOString()}.jpg`,
			{ type: ticketBlob.type }
		);
		formData.append("ticket_photo", ticketFile);

		// 경기장 사진 추가
		const viewResponse = await fetch(viewphoto);
		const viewBlob = await viewResponse.blob();
		const viewFile = new File(
			[viewBlob],
			`view_${new Date().toISOString()}.jpg`,
			{ type: viewBlob.type }
		);
		formData.append("view_photo", viewFile);

		// 추가 사진이 있는 경우
		if (additionalphoto) {
			const additionalResponse = await fetch(additionalphoto);
			const additionalBlob = await additionalResponse.blob();
			const additionalFile = new File(
				[additionalBlob],
				`additional_${new Date().toISOString()}.jpg`,
				{ type: additionalBlob.type }
			);
			formData.append("additional_photo", additionalFile);
		}

		formData.append("message", message);

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
			handleOpenModal("일지가 성공적으로 추가되었습니다");

			// 성공 후 상태 초기화
			setTicketPhoto(null);
			setViewPhoto(null);
			setAdditionalPhoto(null);
			setDate("default");
			setWeather("");
			setTogether("");
			setLocation("");
			setIsWinning("");
			setMessage("");
			setSeatInfo({ section: "", row: "", number: "" });
			setPreview([]);
		} catch (error) {
			console.error("일지 등록중 오류 발생:", error);
			handleOpenModal("일지를 등록하는 동안 오류가 발생했습니다.");
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	// return (
	// 	<div className="pl-4 pr-4 gap-4 flex flex-col md:flex-col lg:flex-col xl:flex-row justify-center items-center w-full rounded">
	// 		<div className="w-1/2 sm:w-full md:w-full lg:w-full h-[700px] sm:h-[1100px] sm:justify-between bg-gray-200 bg-opacity-75 rounded  flex flex-col justify-center items-center">
	// 			<div className="w-full h-50 gap-2 flex flex-col">
	// 				<div className="flex flex-row w-full">
	// 					<div className="w-1/3 h-10 p-8 flex flex-col justify-center items-center  ">
	// 						<label htmlFor="datePicker" className="flex w-full">
	// 							관람일자
	// 						</label>
	// 						<input
	// 							type="date"
	// 							id="datePicker"
	// 							value={date}
	// 							onChange={handleDateChange}
	// 						/>
	// 					</div>
	// 					<div className="w-1/3 h-15  flex flex-col justify-between items-center relative z-30">
	// 						<label className="flex w-full ml-8 mt-2">날씨</label>
	// 						<div className="w-full flex flex-row justify-center items-center mr-4">
	// 							<div className="w-1/3 flex justify-center items-center relative z-30">
	// 								<WeatherToggleMenu onSelect={setWeather} />
	// 							</div>
	// 							<div className="w-2/3 min-w-[70px] flex justify-center">
	// 								<SelectedWeather weather={weather} />
	// 							</div>
	// 						</div>
	// 					</div>
	// 					<div className="w-1/3 h-15  flex flex-col justify-between items-center relative z-30">
	// 						<label className="flex w-full ml-8 mt-2">장소</label>
	// 						<div className="w-full flex flex-row justify-between items-center">
	// 							<div className="w-1/3 flex justify-center items-center">
	// 								<LocationToggleMenu onSelect={setLocation} />
	// 							</div>
	// 							<div className="w-2/3 flex justify-center items-center">
	// 								<SelectedLocation location={location} />
	// 							</div>
	// 						</div>
	// 					</div>
	// 				</div>

	// 				<div className="flex flex-row">
	// 					<div className="w-1/3 h-15 border-l-2  flex flex-col justify-between items-center relative z-10">
	// 						<label className="flex w-full ml-8 mt-2">함께 본 사람</label>
	// 						<div className="w-full flex flex-row justify-between items-center gap-2">
	// 							<div className="w-1/3 flex justify-center items-center">
	// 								<TogetherToggleMenu onSelect={setTogether} />
	// 							</div>
	// 							<div className="w-2/3 flex justify-center items-center">
	// 								<SelectedTogether together={together} />
	// 							</div>
	// 						</div>
	// 					</div>
	// 					<div className="w-1/3 h-15  flex flex-col justify-between items-center relative z-10">
	// 						<label className="flex w-full ml-8 mt-2">승패선택</label>
	// 						<div className="w-full flex flex-row justify-center items-center gap-2">
	// 							<div className="w-1/3 flex justify-center items-center">
	// 								<WinningToggleMenu onSelect={setIsWinning} />
	// 							</div>
	// 							<div className="w-2/3 flex justify-center items-center">
	// 								<SelectedWinningMode winningmode={isWinning} />
	// 							</div>
	// 						</div>
	// 					</div>
	// 					<div className="w-1/3 h-15  flex flex-col justify-between items-center relative z-10">
	// 						<div className="w-full flex flex-row justify-between items-center">
	// 							<label className="ml-4 mt-2">좌석</label>
	// 							<div className="w-1/3 mr-4 flex justify-center items-center">
	// 								<SectionToggleMenu
	// 									location={location}
	// 									onSelect={(value) => updateSeatInfo("section", value)}
	// 								/>
	// 								<RowToggleMenu
	// 									onSelect={(value) => updateSeatInfo("row", value)}
	// 								/>
	// 								<NumberToggleMenu
	// 									onSelect={(value) => updateSeatInfo("number", value)}
	// 								/>
	// 							</div>
	// 						</div>
	// 						<div className="w-full flex flex-row justify-center items-center gap-2">
	// 							<div className="pl-4 pr-4 pb-2 w-full flex justify-between items-center">
	// 								<SelectedSection
	// 									location={location}
	// 									section={seatInfo.section}
	// 								/>
	// 								<SelectedRow row={seatInfo.row} />
	// 								<SelectedNumber number={seatInfo.number} />
	// 							</div>
	// 						</div>
	// 					</div>
	// 				</div>
	// 			</div>

	// 			<div className=" w-full mb-2 rounded flex flex-col justify-center sm:justify-between  items-center gap-4 p-4  sm:h-[800px]   xl:h-[800px] ">
	// 				<div className="w-full  p-2 rounded flex justify-center">
	// 					<p>티켓 사진과 경기장 사진은 필수 입니다! </p>
	// 				</div>
	// 				<div className="w-full flex flex-row justify-center items-center gap-4 sm:h-[700px] sm:flex-col md:flex-row lg:flex-row xl:flex-row">
	// 					<div className="w-[200px] h-[200px] rounded-lg flex flex-row justify-center items-center cursor-pointer mb-4 sm:mb-0">
	// 						<DiaryPhotoUpload
	// 							onDiaryPhotoUpload={handleDiaryPhotoChange}
	// 							type="ticket"
	// 						/>
	// 					</div>
	// 					<div className="w-[200px] h-[200px] rounded-lg flex flex-row justify-center items-center cursor-pointer mb-4 sm:mb-0">
	// 						<DiaryPhotoUpload
	// 							onDiaryPhotoUpload={handleDiaryPhotoChange}
	// 							type="view"
	// 						/>
	// 					</div>
	// 					<div className="w-[200px] h-[200px] rounded-lg flex flex-row justify-center items-center cursor-pointer mb-4 sm:mb-0">
	// 						<DiaryPhotoUpload
	// 							onDiaryPhotoUpload={handleDiaryPhotoChange}
	// 							type="additional"
	// 						/>
	// 					</div>
	// 				</div>
	// 			</div>
	// 			<div className="w-full h-20 bg-black bg-opacity-75 rounded ">
	// 				<textarea
	// 					value={message}
	// 					className="w-full h-full rounded p-4 focus:outline-none"
	// 					placeholder="간단한 메시지"
	// 					onChange={onChangeMessage}
	// 				></textarea>
	// 			</div>
	// 			<div className="w-full h-[100px] flex justify-center items-center">
	// 				<button
	// 					className={`rounded-lg w-[100px] h-[40px] flex justify-center items-center ${
	// 						isLoading ||
	// 						!ticketphoto ||
	// 						!viewphoto ||
	// 						!message ||
	// 						!date ||
	// 						!weather ||
	// 						!location ||
	// 						!together ||
	// 						!isWinning
	// 							? "bg-gray-400"
	// 							: "bg-gray-400 hover:bg-red-500"
	// 					}`}
	// 					onClick={postData}
	// 					disabled={
	// 						isLoading ||
	// 						!ticketphoto ||
	// 						!viewphoto ||
	// 						!message ||
	// 						!date ||
	// 						!weather ||
	// 						!location ||
	// 						!together ||
	// 						!isWinning
	// 					} // 로딩 중일 때 버튼 비활성화
	// 				>
	// 					{isLoading ? (
	// 						<svg
	// 							className="animate-spin h-5 w-5 text-white"
	// 							xmlns="http://www.w3.org/2000/svg"
	// 							fill="none"
	// 							viewBox="0 0 24 24"
	// 						>
	// 							<circle
	// 								className="opacity-25"
	// 								cx="12"
	// 								cy="12"
	// 								r="10"
	// 								stroke="currentColor"
	// 								strokeWidth="4"
	// 							></circle>
	// 							<path
	// 								className="opacity-75"
	// 								fill="currentColor"
	// 								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
	// 							></path>
	// 						</svg>
	// 					) : (
	// 						"올리기"
	// 					)}
	// 				</button>
	// 			</div>
	// 		</div>
	// 		<div className="w-1/2 sm:w-full md:w-full lg:w-full h-[700px] bg-gray-200 bg-opacity-75 rounded flex flex-col justify-center items-center  ">
	// 			<div>Live Game</div>
	// 			<DiaryTabs />
	// 		</div>

	// 		{/*Modal 컴포넌트*/}
	// 		<AlertModal
	// 			isOpen={isOpen}
	// 			message={modalMessage}
	// 			onClose={handleCloseModal}
	// 		/>
	// 	</div>
	// );
	return (
		<div className="pl-4 pr-4 gap-4 flex flex-col md:flex-col lg:flex-col xl:flex-row 2xl:flex-row justify-center items-center w-full rounded">
			<div className="w-1/2 sm:w-full md:w-full lg:w-full h-[700px] sm:pt-8 sm:h-[1700px] sm:justify-between bg-gray-200 bg-opacity-75 rounded flex flex-col justify-center items-center">
				<div className="w-full h-50 gap-4 flex flex-col">
					{" "}
					{/* gap-2를 gap-4로 변경 */}
					<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row w-full gap-4">
						{" "}
						{/* sm:flex-row 제거, gap 추가 */}
						<div className="w-full md:w-1/3 lg:w-1/3 xl:w-1/3 2xl:w-1/3 h-15 p-4 sm:p-0 flex flex-col">
							{" "}
							{/* sm:w-1/3 제거 */}
							<label htmlFor="datePicker" className="flex w-full sm:bg-red-500">
								관람일자
							</label>
							<input
								type="date"
								id="datePicker"
								value={date}
								className="w-full"
								onChange={handleDateChange}
							/>
						</div>
						<div className="w-full md:w-1/3 h-15 flex flex-col justify-between items-center relative z-50">
							{" "}
							{/* sm:w-1/3 제거 */}
							<label className="flex w-full  sm:bg-red-500 sm:ml-0 ml-8 mt-2 ">
								날씨
							</label>
							<div className="w-full flex flex-row justify-center items-center mr-4">
								<div className="w-1/3 flex justify-center items-center relative z-30">
									<WeatherToggleMenu onSelect={setWeather} />
								</div>
								<div className="w-2/3 min-w-[70px] flex justify-center">
									<SelectedWeather weather={weather} />
								</div>
							</div>
						</div>
						<div className="w-full md:w-1/3 h-15 flex flex-col justify-between items-center relative z-40">
							{" "}
							{/* sm:w-1/3 제거 */}
							<label className="flex w-full  sm:bg-red-500 sm:ml-0 ml-8 mt-2">
								장소
							</label>
							<div className="w-full flex flex-row justify-between items-center">
								<div className="w-1/3 flex justify-center items-center">
									<LocationToggleMenu onSelect={setLocation} />
								</div>
								<div className="w-2/3 flex justify-center items-center">
									<SelectedLocation location={location} />
								</div>
							</div>
						</div>
					</div>
					<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row gap-4 ">
						{" "}
						{/* sm:flex-row 제거, gap 추가 */}
						<div className="w-full md:w-1/3 h-15 border-l-2 flex flex-col justify-between items-center relative z-30">
							{" "}
							{/* sm:w-1/3 제거 */}
							<label className="flex w-full  sm:bg-red-500 sm:ml-0 ml-8 mt-2">
								함께 본 사람
							</label>
							<div className="w-full flex flex-row justify-between items-center gap-2">
								<div className="w-1/3 flex justify-center items-center">
									<TogetherToggleMenu onSelect={setTogether} />
								</div>
								<div className="w-2/3 flex justify-center items-center">
									<SelectedTogether together={together} />
								</div>
							</div>
						</div>
						<div className="w-full md:w-1/3 h-15 flex flex-col justify-between items-center relative z-20">
							{" "}
							{/* sm:w-1/3 제거 */}
							<label className="flex w-full  sm:bg-red-500 sm:ml-0 ml-8 mt-2">
								승패선택
							</label>
							<div className="w-full flex flex-row justify-center items-center gap-2">
								<div className="w-1/3 flex justify-center items-center">
									<WinningToggleMenu onSelect={setIsWinning} />
								</div>
								<div className="w-2/3 flex justify-center items-center">
									<SelectedWinningMode winningmode={isWinning} />
								</div>
							</div>
						</div>
						<div className="w-full md:w-1/3 h-15 flex flex-col justify-between items-center relative z-10">
							{" "}
							{/* sm:w-1/3 제거 */}
							<div className="w-full  sm:bg-red-500 flex flex-row justify-between items-center">
								<label className="ml-4 mt-2">좌석</label>
								<div className="w-1/3 mr-4 flex justify-center items-center">
									<SectionToggleMenu
										location={location}
										onSelect={(value) => updateSeatInfo("section", value)}
									/>
									<RowToggleMenu
										onSelect={(value) => updateSeatInfo("row", value)}
									/>
									<NumberToggleMenu
										onSelect={(value) => updateSeatInfo("number", value)}
									/>
								</div>
							</div>
							<div className="w-full flex flex-row justify-center items-center gap-2">
								<div className="pl-4 pr-4 pb-2 w-full flex justify-between items-center">
									<SelectedSection
										location={location}
										section={seatInfo.section}
									/>
									<SelectedRow row={seatInfo.row} />
									<SelectedNumber number={seatInfo.number} />
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full mb-2 rounded flex flex-col justify-center sm:justify-between items-center gap-4 p-4 sm:h-[800px]">
					<div className="w-full p-2 rounded flex justify-center">
						<p>티켓 사진과 경기장 사진은 필수 입니다!</p>
					</div>
					<div className="w-full flex flex-row justify-center items-center gap-4 sm:h-[700px] sm:flex-col md:flex-row lg:flex-row xl:flex-row">
						<div className="w-[200px] h-[200px] rounded-lg flex flex-row justify-center items-center cursor-pointer mb-4 sm:mb-0">
							<DiaryPhotoUpload
								onDiaryPhotoUpload={handleDiaryPhotoChange}
								type="ticket"
							/>
						</div>
						<div className="w-[200px] h-[200px] rounded-lg flex flex-row justify-center items-center cursor-pointer mb-4 sm:mb-0">
							<DiaryPhotoUpload
								onDiaryPhotoUpload={handleDiaryPhotoChange}
								type="view"
							/>
						</div>
						<div className="w-[200px] h-[200px] rounded-lg flex flex-row justify-center items-center cursor-pointer mb-4 sm:mb-0">
							<DiaryPhotoUpload
								onDiaryPhotoUpload={handleDiaryPhotoChange}
								type="additional"
							/>
						</div>
					</div>
				</div>

				<div className="w-full h-20 bg-black bg-opacity-75 rounded">
					<textarea
						value={message}
						className="w-full h-full rounded p-4 focus:outline-none"
						placeholder="간단한 메시지"
						onChange={onChangeMessage}
					></textarea>
				</div>

				<div className="w-full h-[100px] flex justify-center items-center">
					<button
						className={`rounded-lg w-[100px] h-[40px] flex justify-center items-center ${
							isLoading ||
							!ticketphoto ||
							!viewphoto ||
							!message ||
							!date ||
							!weather ||
							!location ||
							!together ||
							!isWinning
								? "bg-gray-400"
								: "bg-gray-400 hover:bg-red-500"
						}`}
						onClick={postData}
						disabled={
							isLoading ||
							!ticketphoto ||
							!viewphoto ||
							!message ||
							!date ||
							!weather ||
							!location ||
							!together ||
							!isWinning
						}
					>
						{isLoading ? (
							<svg
								className="animate-spin h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						) : (
							"올리기"
						)}
					</button>
				</div>
			</div>

			<div className="w-1/2 sm:w-full md:w-full lg:w-full  h-[700px] bg-gray-200 bg-opacity-75 rounded flex flex-col justify-center items-center">
				<div>Live Game</div>
				<DiaryTabs />
			</div>

			<AlertModal
				isOpen={isOpen}
				message={modalMessage}
				onClose={handleCloseModal}
			/>
		</div>
	);
};

export default BasketballDiary;
