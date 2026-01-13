"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiaryEntry } from "@/features/diary/types";
import { where, weather, together, result } from "@/shared/constants";
import Image from "next/image";
import { useLoading } from "@/context/LoadingContext";
import LoadingSpinner from "@/shared/ui/loadingSpinner";
import AlertModal from "@/shared/ui/alertModal";
import { useDiaryListQuery } from "@/features/diary/queries";

interface Props {}

const DiaryRead: React.FC<Props> = (props) => {
	const { setIsLoading } = useLoading();
	const router = useRouter();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMessage, setModalMessage] = useState("");

	// React Query를 사용하여 일지 목록 조회
	const { data: diaries = [], isLoading, error } = useDiaryListQuery();

	// 인증 체크는 middleware에서 처리됨

	// 로딩 상태 동기화
	useEffect(() => {
		setIsLoading(isLoading);
	}, [isLoading, setIsLoading]);

	const closeModal = () => {
		setModalOpen(false);
	};

	// 로딩 중일 때
	if (isLoading) {
		return <LoadingSpinner />;
	}
	return (
		<>
			<div className="w-full min-h-screen relative">
				<div className="w-full p-8 bg-black bg-opacity-75">
					{/* 헤더 및 작성하기 버튼 */}
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-bold text-white">직관일지</h1>
						<button
							onClick={() => router.push("/diary/create")}
							className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
						>
							작성하기
						</button>
					</div>

					{/* 일지 목록 */}
					<div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
						{diaries && diaries.length > 0 ? (
							<div className="flex flex-col gap-4 w-full">
								{diaries.map((diary) => {
									const diaryId = diary.id || diary._id || "";
									const diaryDate = diary.date || diary.createdAt || "";
									const diaryWeather = diary.weather || "";
									const seatSection = diary.seat_info?.section || "";
									const seatRow = diary.seatRow || diary.seat_info?.row || "";
									const seatNumber =
										diary.seatNumber || diary.seat_info?.number || "";
									const diaryName = diary.name || diary.nickname || "";

									// 백엔드 API 응답: photoUrls는 이미 서명된 URL 배열
									const photoSrc =
										diary.photoUrls && diary.photoUrls.length > 0
											? diary.photoUrls[0]
											: "";

									return (
										<div
											key={diaryId}
											onClick={() => router.push(`/diary/${diaryId}`)}
											className="w-full bg-white rounded-lg cursor-pointer hover:shadow-lg transition-shadow p-4 flex gap-4 items-center"
										>
											{photoSrc && (
												<div className="flex-shrink-0 w-32 h-32 relative">
													<Image
														src={photoSrc}
														alt="diary entry"
														fill
														style={{ objectFit: "cover" }}
														className="rounded border shadow"
													/>
												</div>
											)}

											<div className="flex flex-col flex-1 text-sm gap-2">
												{diaryName && (
													<span className="font-semibold text-base">
														{diaryName}
													</span>
												)}
												<div className="flex flex-wrap gap-4 text-gray-600">
													<span>
														관람일자:{" "}
														{diaryDate
															? new Date(diaryDate).toLocaleDateString()
															: "-"}
													</span>
													{diaryWeather && (
														<span>
															날씨:{" "}
															{weather[diaryWeather as keyof typeof weather]}
														</span>
													)}
													{(seatSection || seatRow || seatNumber) && (
														<span>
															좌석:{" "}
															{seatSection && seatRow && seatNumber
																? `${seatSection}/${seatRow}/${seatNumber}`
																: seatRow && seatNumber
																? `${seatRow}/${seatNumber}`
																: "-"}
														</span>
													)}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center text-white py-12">
								<p className="text-lg mb-4">일지가 없습니다.</p>
								<button
									onClick={() => router.push("/diary/create")}
									className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
								>
									첫 일지 작성하기
								</button>
							</div>
						)}
						{isLoading && <LoadingSpinner />}
						{error && (
							<div className="text-white">
								일지를 불러오는 중 오류가 발생했습니다.
							</div>
						)}
					</div>
				</div>
				<AlertModal
					isOpen={modalOpen}
					onClose={closeModal}
					message={modalMessage}
				/>
			</div>
		</>
	);
};

export default DiaryRead;
