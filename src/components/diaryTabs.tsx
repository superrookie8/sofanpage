"use client";
import { DiaryEntry } from "@/data/diary";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { where, weather, together, result } from "@/data/constants";
import { fetchUserStats } from "@/api";
import UserProfileModal from "./userProfileModal";
import Modal from "./alertModal";

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
		// 비동기 fetch 요청
		const response = await fetch(
			`/api/getuserdiaries?user=${filter.nickname}&page=${filter.page}&page_size=${filter.pageSize}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`, // JWT 토큰을 Authorization 헤더에 포함
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch diary entries");
		}

		// 서버에서 받은 데이터를 JSON으로 파싱
		const data = await response.json();

		// 배열로 직접 반환 (data가 배열일 경우)
		if (Array.isArray(data)) {
			return data;
		} else {
			console.error("Expected array but got:", data);
			return [];
		}
	} catch (error) {
		console.error("Error fetching diaries:", error);
		return []; // 오류 발생 시 빈 배열 반환
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
			console.error("Expected array but got:", data);
			return [];
		}
	} catch (error) {
		console.error("Error fetching all diaries:", error);
		return [];
	}
};

export const deleteDiaryEntry = async (entryId: string): Promise<void> => {
	const response = await fetch(`/api/deletediary?entry_id=${entryId}`,{
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
	});
	if (!response.ok){
        const errorData = await response.json();
		throw new Error(errorData.message);
	}
}

const DiaryTabs: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"A" | "B">("A"); // 기본 A탭
	const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [user, setUser] = useState<string | null>(null); // 사용자 정보 상태 추가
	const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 추가
	const [userStats, setUserStats] = useState({
		win_percentage: 0,
		sunny_percentage: 0,
		home_win_percentage: 0,
		away_win_percentage: 0,
		attendance_percentage: 0,
	}); // 통계 데이터 상태 추가
	const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태 추가
	const [selectedProfile, setSelectedProfile] = useState({
		nickname: "",
		description: "",
		photoUrl: "",
	}); // 선택된 유저의 프로필 상태 추가
	const [diaryToDelete, setDiaryToDelete] = useState<string | null>(null);
	const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

	const handleProfileClick = async (nickname: string) => {
		// 토큰 가져오기
		const token = sessionStorage.getItem("token");

		if (!token) {
			console.error("No token found");
			return;
		}

		try {
			// 선택된 유저의 정보를 가져오기
			const profileResponse = await fetch(
				`/api/getuserinfo?nickname=${nickname}`,
				{
					headers: {
						Authorization: `Bearer ${token}`, // 토큰을 헤더에 포함
					},
				}
			);

			if (!profileResponse.ok) {
				throw new Error("Failed to fetch profile info");
			}

			const profileData = await profileResponse.json();

			// 통계 정보 가져오기
			const statsData = await fetchUserStats(nickname);

			// 상태 업데이트
			setSelectedProfile({
				nickname: profileData.nickname,
				description: profileData.description || "",
				photoUrl: profileData.photoUrl || "",
			});

			setUserStats(statsData);
			setIsModalOpen(true); // 모달 열기
		} catch (error) {
			console.error("Error fetching profile or stats:", error);
		}
	};

	useEffect(() => {
		const fetchUserAndDiaries = async () => {
			try {
				setLoading(true);

				// 사용자 정보를 먼저 가져옴
				const userInfo = await fetchUserInfo();
				setUser(userInfo.nickname);

				// 사용자 정보가 있을 경우 통계 데이터 가져오기
				if (userInfo.nickname) {
					const stats = await fetchUserStats(userInfo.nickname);
					
					setUserStats(stats);

					// A탭일 때만 개인 일지를 가져옴
					if (activeTab === "A") {
						const personalDiaries = await fetchPersonalDiaries({
							nickname: userInfo.nickname,
							page,
							pageSize,
						});
						setDiaries(personalDiaries);
					}
				}

				// B탭일 때는 전체 일지를 가져옴
				if (activeTab === "B") {
					const allDiaries = await fetchAllDiaries(page, pageSize);
					setDiaries(allDiaries);
				}
			} catch (error) {
				console.error("Error fetching diaries:", error);
			} finally {
				setLoading(false);
			}
		};

		// fetchUserAndDiaries 함수 실행
		fetchUserAndDiaries();
	}, [page, pageSize, activeTab]); // activeTab, page, pageSize 변경 시에만 실행

	// 로딩 중일 때는 로딩 메시지를 출력
	if (loading) {
		return <div>Loading...</div>;
	}

	const handleDeleteEntry = async (entryId: string) => {
		setDiaryToDelete(entryId);
		setIsAlertModalOpen(true);
		setAlertMessage("일지를 삭제하시겠습니까?")
		setIsDeleteConfirm(true);
	};

	const confirmDelete = async () => {
		if (diaryToDelete) {
			try {
				await deleteDiaryEntry(diaryToDelete);
				setDiaries(diaries.filter((diary) => diary._id !== diaryToDelete));
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

	return (
		<div className="w-full h-[600px] p-4">
			{/* 탭 버튼들 */}
			<div className="flex justify-center space-x-4">
				<button
					onClick={() => setActiveTab("A")}
					className={`px-4 py-2 ${
						activeTab === "A" ? "border-b-2 border-red-500" : ""
					}`}
				>
					내가 기록한 직관일지
				</button>
				<button
					onClick={() => setActiveTab("B")}
					className={`px-4 py-2 ${
						activeTab === "B" ? "border-b-2 border-red-500" : ""
					}`}
				>
					전체 직관일지 리스트
				</button>
			</div>

			{/* 통계 정보는 상단에 한 번만 표시 */}
			{activeTab === "A" && (
				<div className="mt-4">
					<div className="flex flex-row justify-between items-center w-full text-sm pl-4 pr-4 border-b-2 border-red-500  shadow-md">
						<span>농구마니아지수: {userStats.attendance_percentage}%</span>
						<span>날씨요정지수: {userStats.sunny_percentage}%</span>
						<span>직관승요지수: {userStats.win_percentage}%</span>
						<span>홈경기 승요지수: {userStats.home_win_percentage}%</span>
					</div>
				</div>
			)}

			<div className="h-[500px] overflow-y-auto">
				{/* 탭에 따른 내용 */}
				<div className="mt-4">
					{/* A 탭 처리 */}
					{activeTab === "A" && Array.isArray(diaries) && diaries.length > 0 ? (
						diaries.map((diary) => (
							<div
								key={diary._id} // 고유 ID로 키 설정
								className="w-full text-xs mb-4 p-4 border-2 border-red-500 rounded-lg bg-white"
							>
								<div className="grid grid-cols-3 gap-4 p-2 w-full">
									{/* 첫 번째 행 */}
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
									{/* 두 번째 행 */}
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
												src={`data:image/jpeg;base64,${diary.diary_photo}`}
												alt="diary entry"
												width={70}
												height={50}
												style={{ objectFit: "cover", width: "auto", height: "auto"  }}
												className="object-cover"
											/>
										</div>
										<div className="w-auto pl-4">{diary.diary_message}</div>
										<button 
										onClick={()=>handleDeleteEntry(diary._id)}
										className="bg-gray-400 rounded-lg w-[100px] h-[40px] hover:bg-red-500 flex justify-center items-center absolute bottom-2 right-2">
											삭제
										</button>
									</div>
								</div>
							</div>
						))
					) : activeTab === "A" ? (
						<div>일지가 없습니다</div>
					) : null}

					{/* B 탭 처리 */}
					{activeTab === "B" && (
						<div className="w-full grid grid-cols-3 sm:grid-cols-1 md:grid-row-3 gap-4">
							{diaries && diaries.length > 0 ? (
								diaries.map((diary) => (
									<div
										key={diary._id}
										className="flex flex-col justify-center items-center w-[200px] h-[300px] bg-gray-300 rounded-lg shadow-md"
									>
										<div className="w-full h-3/5 bg-red-200 rounded-t-lg flex justify-center items-center">
											<Image
												src={`data:image/jpeg;base64,${diary.diary_photo}`}
												alt="diary entry"
												width={100}
												height={100}
												style={{ objectFit: "cover" }}
												className="object-cover rounded-t-lg"
											/>
										</div>
										<div className="flex flex-col w-full h-2/5 p-2 text-sm justify-center pl-8">
											<div>
												<span>아이디: </span>
												<span
													onClick={() => handleProfileClick(diary.name)} // 클릭 시 프로필 정보 로드
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
					{/* 프로필 모달 컴포넌트 */}
					<UserProfileModal
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						profile={selectedProfile}
						userStats={userStats}
					/>
					<Modal
						isOpen={isAlertModalOpen}
						message={alertMessage}
						onClose={closeAlertModal}
						buttonText={isDeleteConfirm ? "확인" : "닫기"}
						onConfirm={isDeleteConfirm ? confirmDelete : closeAlertModal}
					/>
				</div>
			</div>
		</div>
	);
};

export default DiaryTabs;
