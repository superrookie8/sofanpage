"use client";
import { DiaryEntry } from "@/data/diary";
import React, { useState, useEffect } from "react";
import Image from "next/image";

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

		// 데이터가 배열인지 확인
		console.log("API 응답:", data);

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
const DiaryTabs: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"A" | "B">("A"); // 기본 A탭
	const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [user, setUser] = useState<string | null>(null); // 사용자 정보 상태 추가
	const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 추가

	// 토큰을 통해 사용자 정보를 가져오는 함수 호출
	useEffect(() => {
		const fetchUserAndDiaries = async () => {
			try {
				setLoading(true);
				// 사용자 정보를 먼저 가져옴
				const userInfo = await fetchUserInfo();
				setUser(userInfo.nickname); // 사용자 이름 설정

				// 사용자 정보가 있을 경우 일지를 가져옴
				if (userInfo.nickname) {
					const diaries = await fetchPersonalDiaries({
						nickname: userInfo.nickname,
						page,
						pageSize,
					});

					console.log("Fetched diaries:", diaries); // 디버깅용 콘솔 출력

					setDiaries(diaries); // Diaries 상태 업데이트
				}
			} catch (error) {
				console.error("Error fetching user information or diaries:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserAndDiaries();
	}, [page, pageSize]);

	if (loading) {
		return <div>Loading...</div>; // 로딩 중일 때 표시
	}

	if (!user) {
		return <div>No user information available.</div>;
	}

	return (
		<div className="w-full p-4">
			{/* 탭 버튼들 */}
			<div className="flex justify-center space-x-4">
				<button
					onClick={() => setActiveTab("A")}
					className={`px-4 py-2 ${
						activeTab === "A" ? "border-b-2 border-blue-500" : ""
					}`}
				>
					내가 기록한 직관일지
				</button>
				<button
					onClick={() => setActiveTab("B")}
					className={`px-4 py-2 ${
						activeTab === "B" ? "border-b-2 border-blue-500" : ""
					}`}
				>
					전체 직관일지 리스트
				</button>
			</div>

			{/* 통계 정보는 상단에 한 번만 표시 */}
			{activeTab === "A" && (
				<div className="mt-4">
					<div className="flex flex-row justify-center items-center gap-16 p-4 bg-gray-100 rounded-lg shadow-md">
						<span>농구마니아지수: 80%</span>
						<span>날씨요정지수: 50%</span>
						<span>직관승요지수: 30%</span>
						<span>홈경기 승요지수: 20%</span>
					</div>
				</div>
			)}

			{/* 탭에 따른 내용 */}
			<div className="mt-4">
				{activeTab === "A" && Array.isArray(diaries) && diaries.length > 0 ? (
					diaries.map((diary) => (
						<div
							key={diary._id} // 고유 ID로 키 설정
							className="w-full mb-4 p-4 border-2 border-red-500 rounded-lg"
						>
							<div className="flex flex-row justify-start items-center gap-16 pl-4">
								<span>
									관람일자: {new Date(diary.date).toLocaleDateString()}
								</span>
								<span>날씨: {diary.weather}</span>
								<span>함께 본 사람: {diary.together}</span>
							</div>
							<div className="mt-2 bg-yellow-200 flex flex-row items-center p-2 rounded-md">
								<div className="w-[50px] h-[70px] bg-gray-300 flex items-center justify-center rounded-lg">
									{/* <Image
										src={`data:image/jpeg;base64,${diary.diary_photo}`}
										alt="diary entry"
										fill
										style={{ objectFit: "cover" }}
										className="object-cover"
									/> */}
								</div>
								<div className="w-auto pl-4">{diary.diary_message}</div>
							</div>
						</div>
					))
				) : (
					<div>일지를 불러오는 중입니다...</div>
				)}

				{activeTab === "B" && (
					<div className="flex flex-row justify-center items-center gap-4">
						{[...Array(3)].map((_, idx) => (
							<div
								key={idx}
								className="flex flex-col justify-center items-center w-[200px] h-[300px] bg-gray-300 rounded-lg shadow-md"
							>
								<div className="w-full h-3/5 bg-red-200 rounded-t-lg flex justify-center items-center">
									사진영역
								</div>
								<div className="flex flex-col w-full h-2/5 p-2">
									<span>아이디: {`사용자${idx + 1}`}</span>
									<span>농구마니아지수: 80%</span>
									<span>날씨요정지수: 50%</span>
									<span>직관승요지수: 30%</span>
									<span>홈경기승요지수: 20%</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default DiaryTabs;
