"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiaryEntry } from "@/data/diary";
import { where, weather, together, result } from "@/data/constants";
import Image from "next/image";

interface Props {}

export const fetchAllDiariesPage = async (
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

const DiaryRead: React.FC<Props> = (props) => {
	const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [user, setUser] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const router = useRouter();

	useEffect(() => {
		const fetchDiaries = async () => {
			setLoading(true); // 로딩 시작
			const allDiaries = await fetchAllDiariesPage(page, pageSize);
			setDiaries(allDiaries);
			setLoading(false); // 로딩 완료
		};

		fetchDiaries();
	}, [page, pageSize]); // 의존성 배열 설정

	if (loading) {
		return <div>Loading...</div>;
	}

	// 로그인 페이지로 이동하는 함수
	const goToLogin = () => {
		router.push("/login");
	};

	return (
		<>
			<div className="w-full h-[150px] flex flex-col gap-4 justify-center items-center bg-black bg-opacity-75">
				<span className="text-white mr-4">
					작성하려면, 로그인이 필요합니다!
				</span>
				<button
					onClick={goToLogin}
					className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none"
				>
					로그인 바로가기
				</button>
			</div>
			<div className="w-full h-[500px]">
				<div className="w-full p-8 h-[500px] bg-black bg-opacity-75 grid justify-center gap-8 items-center overflow-y-auto">
					{diaries && diaries.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
							{diaries.map((diary) => (
								<div
									key={diary._id}
									className="w-[200px] h-[270px] bg-white rounded"
								>
									<div className="w-full h-3/5 flex justify-center pt-4">
										<Image
											src={`data:image/jpeg;base64,${diary.diary_photo}`}
											alt="diary entry"
											width={150}
											height={100}
											style={{ objectFit: "fill" }}
											className="object-cover rounded border shadow-lg"
										/>
									</div>

									<div className="flex flex-col w-full h-2/5 text-sm pt-4 pl-4 pb-4">
										<span>아이디: {diary.name}</span>
										<span>
											관람일자: {new Date(diary.date).toLocaleDateString()}
										</span>
										<span>
											날씨: {weather[diary.weather as keyof typeof weather]}
										</span>
										<span>
											좌석:{" "}
											{`${diary.seat_info.section}/${diary.seat_info.row}/${diary.seat_info.number}`}
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<p>일지가 없습니다.</p>
					)}
				</div>
			</div>
		</>
	);
};

export default DiaryRead;
