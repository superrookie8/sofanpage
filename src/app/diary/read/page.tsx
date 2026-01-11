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
			<div className="w-full h-[500px]">
				<div className="w-full p-8 h-[500px] bg-black bg-opacity-75 grid justify-center gap-8 items-center overflow-y-auto">
					{diaries && diaries.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
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
										className="w-[200px] h-[270px] bg-white rounded"
									>
										{photoSrc && (
											<div className="w-full h-3/5 flex justify-center pt-4">
												<Image
													src={photoSrc}
													alt="diary entry"
													width={150}
													height={100}
													style={{ objectFit: "fill" }}
													className="object-cover rounded border shadow-lg"
												/>
											</div>
										)}

										<div className="flex flex-col w-full h-2/5 text-sm pt-4 pl-4 pb-4">
											{diaryName && <span>아이디: {diaryName}</span>}
											<span>
												관람일자:{" "}
												{diaryDate
													? new Date(diaryDate).toLocaleDateString()
													: "-"}
											</span>
											<span>
												날씨:{" "}
												{diaryWeather
													? weather[diaryWeather as keyof typeof weather]
													: "-"}
											</span>
											<span>
												좌석:{" "}
												{seatSection && seatRow && seatNumber
													? `${seatSection}/${seatRow}/${seatNumber}`
													: seatRow && seatNumber
													? `${seatRow}/${seatNumber}`
													: "-"}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p>일지가 없습니다.</p>
					)}
					{isLoading && <LoadingSpinner />}
					{error && <div>일지를 불러오는 중 오류가 발생했습니다.</div>}
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
