"use client";
import { DiaryEntry } from "@/data/diary";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { where, weather, together, result } from "@/data/constants";
import { fetchUserStats } from "@/api";
import UserProfileModal from "@/components/mypage/userProfileModal";
import AlertModal from "@/components/shared/alertModal";
import Slider from "react-slick";
import Modal from "react-modal"

// 사용자 정보를 가져오는 함수 (토큰 기반)
export const fetchUserInfo = async (): Promise<{
	nickname: string;
	description?: string;
	photoUrl?: string;
}> => {
	const response = await fetch("/api/getuserinfo", {
		headers: {
			Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
	});
	if (!response.ok) {
		throw new Error("Failed to fetch user info");
	}
	const data = await response.json();
	return data;
};

// 개인 일지를 가져오는 함수
export const fetchPersonalDiaries = async (filter: {
	nickname: string;
	page: number;
	pageSize: number;
}): Promise<DiaryEntry[]> => {
	const token = sessionStorage.getItem("token");

	try {
		const response = await fetch(
			`/api/getuserdiaries?user=${filter.nickname}&page=${filter.page}&page_size=${filter.pageSize}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch diary entries");
		}

		const data = await response.json();

		if (Array.isArray(data)) {
			return data;
		} else {
			return [];
		}
	} catch (error) {
		return [];
	}
};

// 전체 다이어리를 가져오는 함수
export const fetchAllDiaries = async (
	page: number,
	pageSize: number
): Promise<DiaryEntry[]> => {
	try {
		const response = await fetch(
			`/api/getdiaries?page=${page}&page_size=${pageSize}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch all diary entries");
		}

		const data = await response.json();

		if (Array.isArray(data)) {
			return data;
		} else {
			return [];
		}
	} catch (error) {
		return [];
	}
};

export const deleteDiaryEntry = async (entryId: string): Promise<void> => {
	const response = await fetch(`/api/deletediary?entry_id=${entryId}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message);
	}
};

const DiaryTabs: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"A" | "B">("A");
	const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
	const [personalDiaries, setPersonalDiaries] = useState<DiaryEntry[]>([]);
	const [allDiaries, setAllDiaries] = useState<DiaryEntry[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [user, setUser] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [userStats, setUserStats] = useState({
		win_percentage: 0,
		sunny_percentage: 0,
		home_win_percentage: 0,
		away_win_percentage: 0,
		attendance_percentage: 0,
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedProfile, setSelectedProfile] = useState({
		nickname: "",
		description: "",
		photoUrl: "",
	});
	const [diaryToDelete, setDiaryToDelete] = useState<string | null>(null);
	const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [currentImages, setCurrentImages] = useState<string[]>([]);

	const handleProfileClick = async (nickname: string) => {
		const token = sessionStorage.getItem("token");

		if (!token) {
			console.error("No token found");
			return;
		}

		try {
			const profileResponse = await fetch(
				`/api/getuserinfo?nickname=${nickname}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!profileResponse.ok) {
				throw new Error("Failed to fetch profile info");
			}

			const profileData = await profileResponse.json();
			const statsData = await fetchUserStats(nickname);

			setSelectedProfile({
				nickname: profileData.nickname,
				description: profileData.description || "",
				photoUrl: profileData.photoUrl || "",
			});

			setUserStats(statsData);
			setIsModalOpen(true);
		} catch (error) {
			console.error("Error fetching profile or stats:", error);
		}
	};

	useEffect(() => {
		const fetchUserAndDiaries = async () => {
			try {
				setLoading(true);

				const userInfo = await fetchUserInfo();
				setUser(userInfo.nickname);

				if (userInfo.nickname) {
					const stats = await fetchUserStats(userInfo.nickname);
					setUserStats(stats);

					const [personalDiaries, allDiaries] = await Promise.all([
						fetchPersonalDiaries({
							nickname: userInfo.nickname,
							page,
							pageSize,
						}),
						fetchAllDiaries(page, pageSize),
					]);

					setPersonalDiaries(personalDiaries);
					setAllDiaries(allDiaries);

					if (activeTab === "A") {
						setDiaries(personalDiaries);
					} else if (activeTab === "B") {
						setDiaries(allDiaries);
					}
				}
			} catch (error) {
				console.error("Error fetching diaries:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserAndDiaries();
	}, [page, pageSize, activeTab]); // activeTab, page, pageSize 변경 시에만 실행

	// 로딩 중일 때는 로딩 메시지를 출력
	if (loading) {
		return <div>Loading...</div>;
	}

	

	const handleDeleteEntry = async (entryId: string) => {
		setDiaryToDelete(entryId);
		setIsAlertModalOpen(true);
		setAlertMessage("일지를 삭제하시겠습니까?");
		setIsDeleteConfirm(true);
	};

	const confirmDelete = async () => {
		if (diaryToDelete) {
			try {
				await deleteDiaryEntry(diaryToDelete);
				setPersonalDiaries(personalDiaries.filter((diary) => diary._id !== diaryToDelete));
				setAllDiaries(allDiaries.filter((diary) => diary._id !== diaryToDelete));
				if (activeTab === "A") {
					setDiaries(personalDiaries.filter((diary) => diary._id !== diaryToDelete));
				} else if (activeTab === "B") {
					setDiaries(allDiaries.filter((diary) => diary._id !== diaryToDelete));
				}
				setAlertMessage("일지가 성공적으로 삭제되었습니다.");
				setIsDeleteConfirm(false);
				setIsAlertModalOpen(false);
			} catch (error) {
				console.error("Error deleting diary entry:", error);
				setAlertMessage("일지 삭제 중 오류가 발생했습니다.");
			}
		}
	};

	const closeAlertModal = () => {
		setIsAlertModalOpen(false);
		setDiaryToDelete(null);
	};

	const handleTabClick = (tab: "A" | "B") => {
		setActiveTab(tab);
		if (tab === "A") {
			setDiaries(personalDiaries);
		} else if (tab === "B") {
			setDiaries(allDiaries);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	const handleImageClick = (diary:DiaryEntry) => {
		const images = [
			diary.diary_photos?.ticket_photo,
			diary.diary_photos?.view_photo,
			diary.diary_photos?.additional_photo,
		].filter((image): image is string => Boolean(image));
		setCurrentImages(images);
		setIsImageModalOpen(true);
	}

	const closeImageModal = () => {
		setIsImageModalOpen(false);
		setCurrentImages([]);
	}

	const sliderSettings = {
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		draggable: true,
		swipe: true,
		swipeToSlide: true,
	};



	return (
		<div className="w-full h-[600px] p-4">
			<div className="flex justify-center space-x-4">
				<button
					onClick={() => handleTabClick("A")}
					className={`px-4 py-2 ${
						activeTab === "A" ? "border-b-2 border-red-500" : ""
					}`}
				>
					내가 기록한 직관일지
				</button>
				<button
					onClick={() => handleTabClick("B")}
					className={`px-4 py-2 ${
						activeTab === "B" ? "border-b-2 border-red-500" : ""
					}`}
				>
					전체 직관일지 리스트
				</button>
			</div>

			{activeTab === "A" && (
				<div className="mt-4">
					<div className="flex flex-row justify-between items-center w-full text-sm pl-4 pr-4 border-b-2 border-red-500 shadow-md">
						<span>농구마니아지수: {userStats.attendance_percentage}%</span>
						<span>날씨요정지수: {userStats.sunny_percentage}%</span>
						<span>직관승요지수: {userStats.win_percentage}%</span>
						<span>홈경기 승요지수: {userStats.home_win_percentage}%</span>
					</div>
				</div>
			)}

			<div className="h-[500px] overflow-y-auto">
				<div className="mt-4">
					{activeTab === "A" && Array.isArray(diaries) && diaries.length > 0 ? (
						diaries.map((diary) => (
							<div
								key={diary._id}
								className="w-full text-xs mb-4 p-4 border-2 border-red-500 rounded-lg bg-white"
							>
								<div className="grid grid-cols-3 gap-4 p-2 w-full">
									<div className="flex justify-between items-center sm:flex-col sm:justify-center sm:items-start">
										<span className="flex justify-end w-1/3 min-w-[70px] sm:w-full sm:justify-start">
											관람일자:
										</span>
										<span className="text-right flex justify-center w-2/3">
											{new Date(diary.date).toLocaleDateString()}
										</span>
									</div>
									<div className="flex w-full items-center sm:flex-col sm:justify-center sm:items-start">
										<span className="flex justify-end w-1/3">날씨:</span>
										<span className="text-right flex justify-center w-2/3 sm:w-full">
											{weather[diary.weather as keyof typeof weather]}
										</span>
									</div>
									<div className="flex justify-between items-center sm:flex-col sm:justify-center sm:items-start">
										<span>장소:</span>
										<span className="text-right flex justify-center w-2/3 sm:w-full">
											{where[diary.location as keyof typeof where] ||
												"알 수 없는 장소"}
										</span>
									</div>
									<div className="flex justify-between items-center sm:flex-col sm:justify-center sm:items-start">
										<span className="flex justify-end w-1/3 min-w-[70px]">
											함께 본 사람:
										</span>
										<span className="text-right flex justify-center w-2/3 sm:w-full">
											{together[diary.together as keyof typeof together]}
										</span>
									</div>
									<div className="flex justify-between items-center sm:flex-col sm:justify-center sm:items-start">
										<span className="flex justify-end w-1/3">결과:</span>
										<span className="text-right flex justify-center w-2/3 sm:w-full">
											{result[diary.win_status as keyof typeof result]}
										</span>
									</div>
									<div className="flex justify-between items-center sm:flex-col sm:justify-center sm:items-start">
										<span>좌석:</span>
										<span className="text-right flex justify-center w-2/3 sm:w-full">
											{`${diary.seat_info.section}/${diary.seat_info.row}/${diary.seat_info.number}`}
										</span>
									</div>
								</div>
								<div className="flex flex-row justify-between items-center">
									<div className="mt-2 w-full bg-red-200 flex flex-row items-center p-2 rounded-md relative">
										<div className="w-[100px] h-[70px] bg-gray-300 flex items-center justify-center rounded-lg">
											<Image
												src={`data:image/jpeg;base64,${diary.diary_photos?.ticket_photo}`}
												alt="diary ticket photo"
												width={70}
												height={50}
												style={{ objectFit: "cover", width: "auto", height: "70px" }}
												className="object-cover"
												onClick={() => handleImageClick(diary)}
											/>
										</div>
										<div className="w-auto pl-4">{diary.diary_message}</div>
										<button
											onClick={() => handleDeleteEntry(diary._id)}
											className="bg-gray-400 rounded-lg w-[100px] h-[40px] hover:bg-red-500 flex justify-center items-center absolute bottom-2 right-2"
										>
											삭제
										</button>
									</div>
								</div>
							</div>
						))
					) : activeTab === "A" ? (
						<div>일지가 없습니다</div>
					) : null}

					{activeTab === "B" && (
						<div className="w-full sm:flex-col sm:flex sm:justify-center sm:items-center grid grid-cols-3 sm:grid-cols-1 md:grid-row-3 gap-4">
							{diaries && diaries.length > 0 ? (
								diaries.map((diary) => (
									<div
										key={diary._id}
										className="flex flex-col justify-center items-center w-[200px] h-[300px] bg-gray-200 rounded-lg shadow-md"
									>
										<div className="w-full h-3/5 bg-white rounded-t-lg flex justify-center items-center">
											<Image
												src={`data:image/jpeg;base64,${diary.diary_photos?.ticket_photo}`}
												alt="diary entry"
												width={100}
												height={100}
												style={{ objectFit: "cover", cursor: "pointer" }}
												className="object-cover rounded-t-lg"
												onClick={() => handleImageClick(diary)}
											/>
										</div>
										<div className="flex flex-col w-full h-2/5 p-2 text-sm justify-center pl-8">
											<div>
												<span>아이디: </span>
												<span
													onClick={() => handleProfileClick(diary.name)}
													className="cursor-pointer text-blue-500 hover:underline"
												>
													{diary.name}
												</span>
											</div>
											<span>
												관람일자: {new Date(diary.date).toLocaleDateString()}
											</span>
											<span>
												날씨: {weather[diary.weather as keyof typeof weather]}
											</span>
											<span>
												좌석:
												{`${diary.seat_info.section}/${diary.seat_info.row}/${diary.seat_info.number}`}
											</span>
										</div>
									</div>
								))
							) : (
								<div>일지를 불러오는 중입니다...</div>
							)}
						</div>
					)}
					<UserProfileModal
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						profile={selectedProfile}
						userStats={userStats}
					/>
					<AlertModal
						isOpen={isAlertModalOpen}
						message={alertMessage}
						onClose={closeAlertModal}
						buttonText={isDeleteConfirm ? "확인" : "닫기"}
						onConfirm={isDeleteConfirm ? confirmDelete : closeAlertModal}
					/>
					<Modal
						isOpen={isImageModalOpen}
						onRequestClose={closeImageModal}
						contentLabel="Image Modal"
						className="modal"
						overlayClassName="overlay"
						

					>
					<Slider {...sliderSettings}>
						{currentImages.map((image, index) => (
							<div key={index} className="w-full h-full">
								<Image
									src={`data:image/jpeg;base64,${image}`}
									alt={`diary photo ${index + 1}`}
									width={100}
									height={50}
									style={{ objectFit: "cover", width: "100%", height: "100%" }}
									className="object-cover"
								/>
							</div>
						))}
					</Slider>
					<button onClick={closeImageModal} style={{ cursor: 'pointer', marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '5px' }}>닫기</button> 
					</Modal>
				</div>
			</div>
		</div>
	);
};

export default DiaryTabs;