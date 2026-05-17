// src/app/diary/[id]/page.tsx
"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useDiaryQuery } from "@/features/diary/queries";
import LoadingSpinner from "@/shared/ui/loadingSpinner";
import AlertModal from "@/shared/ui/alertModal";
import { format } from "date-fns";
import Image from "next/image";
import { statMeta } from "@/features/diary/editor/constants";
import { weather } from "@/shared/constants";

export default function DiaryDetailPage() {
	const params = useParams();
	const router = useRouter();
	const diaryId = params?.id as string;

	const { data: diary, isLoading, error } = useDiaryQuery(diaryId);

	const [modalOpen, setModalOpen] = React.useState(false);
	const [modalMessage, setModalMessage] = React.useState("");

	React.useEffect(() => {
		if (error) {
			setModalMessage("일지를 불러오는 중 오류가 발생했습니다.");
			setModalOpen(true);
		}
	}, [error]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (!diary) {
		return (
			<div className="flex items-center justify-center min-h-screen relative">
				<div className="text-center">
					<p className="text-lg mb-4">일지를 찾을 수 없습니다.</p>
					<button
						onClick={() => router.push("/diary/read")}
						className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
					>
						목록으로 돌아가기
					</button>
				</div>
			</div>
		);
	}

	// 좌석 정보 포맷팅
	const seatInfo =
		diary.seat?.trim() ||
		(diary.seatInfo
			? [
					diary.seatInfo.floor,
					diary.seatInfo.zoneName,
					diary.seatInfo.blockName,
					diary.seatInfo.row,
					diary.seatInfo.number,
				]
					.filter(Boolean)
					.join(" ")
			: diary.seatRow && diary.seatNumber
			? `${diary.seatRow} ${diary.seatNumber}`.replace(/\s+/g, " ").trim()
			: diary.seat_info
			? [
					diary.seat_info.section,
					diary.seat_info.row,
					diary.seat_info.number,
				]
					.filter(Boolean)
					.join(" ")
			: "") || "-";

	// 날씨 정보
	const weatherText = diary.weather
		? weather[diary.weather as keyof typeof weather] || diary.weather
		: null;

	// 2점 야투율 계산
	const fg2Percent =
		diary.cheeredPlayerTwoPointMade !== undefined &&
		diary.cheeredPlayerTwoPointPercent !== undefined
			? diary.cheeredPlayerTwoPointPercent
			: null;

	// 3점 야투율 계산
	const fg3Percent =
		diary.cheeredPlayerThreePointMade !== undefined &&
		diary.cheeredPlayerThreePointPercent !== undefined
			? diary.cheeredPlayerThreePointPercent
			: null;

	return (
		<div className="min-h-screen bg-gray-50 relative">
			<div className="mx-auto max-w-5xl px-4 py-6">
				<div className="flex items-center justify-between mb-4">
					<button
						onClick={() => router.push("/diary/read")}
						className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
					>
						← 목록으로
					</button>
					<button
						onClick={() => router.push(`/diary/${diaryId}/edit`)}
						className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
					>
						수정하기
					</button>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6 md:p-8">
					<h1 className="text-3xl font-bold mb-6">직관일지 상세</h1>

					{/* 기본 정보 */}
					<div className="mb-8 border-b pb-6">
						<h2 className="text-xl font-semibold mb-4">📅 기본 정보</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col">
								<span className="text-gray-500 text-sm mb-1">날짜</span>
								<span className="font-medium">
									{diary.date || diary.createdAt
										? format(
												new Date(diary.date || diary.createdAt),
												"yyyy년 MM월 dd일"
										  )
										: "-"}
								</span>
							</div>
							<div className="flex flex-col">
								<span className="text-gray-500 text-sm mb-1">관람 유형</span>
								<span className="font-medium">
									{diary.watchType === "DIRECT" ? "직관" : "집관"}
								</span>
							</div>
							{diary.location && (
								<div className="flex flex-col">
									<span className="text-gray-500 text-sm mb-1">장소</span>
									<span className="font-medium">{diary.location}</span>
								</div>
							)}
							{weatherText && (
								<div className="flex flex-col">
									<span className="text-gray-500 text-sm mb-1">날씨</span>
									<span className="font-medium">{weatherText}</span>
								</div>
							)}
							{diary.gameWinner && (
								<div className="flex flex-col">
									<span className="text-gray-500 text-sm mb-1">경기 결과</span>
									<span className="font-medium">
										{diary.gameWinner === "HOME" ? "승" : "패"}
									</span>
								</div>
							)}
							{(diary.gameHomeScore !== undefined ||
								diary.gameAwayScore !== undefined) && (
								<div className="flex flex-col">
									<span className="text-gray-500 text-sm mb-1">스코어</span>
									<span className="font-medium">
										{diary.gameHomeScore ?? "-"} : {diary.gameAwayScore ?? "-"}
									</span>
								</div>
							)}
							{diary.companion && diary.companion.length > 0 && (
								<div className="flex flex-col">
									<span className="text-gray-500 text-sm mb-1">동행자</span>
									<span className="font-medium">
										{diary.companion.join(", ")}
									</span>
								</div>
							)}
							{seatInfo !== "-" && (
								<div className="flex flex-col">
									<span className="text-gray-500 text-sm mb-1">좌석</span>
									<span className="font-medium">{seatInfo}</span>
								</div>
							)}
						</div>
					</div>

					{/* MVP */}
					{diary.mvpPlayerName && (
						<div className="mb-8 border-b pb-6">
							<h2 className="text-xl font-semibold mb-4">🏆 MVP</h2>
							<div className="bg-yellow-50 rounded-lg p-4">
								<p className="text-lg font-semibold text-yellow-800">
									{diary.mvpPlayerName}
								</p>
							</div>
						</div>
					)}

					{/* 응원 선수 기록 */}
					{diary.cheeredPlayerName && (
						<div className="mb-8 border-b pb-6">
							<h2 className="text-xl font-semibold mb-4">👤 응원 선수 기록</h2>
							<div className="bg-blue-50 rounded-lg p-6">
								<div className="mb-4">
									<h3 className="text-lg font-semibold mb-2">
										{diary.cheeredPlayerName}
									</h3>
									{diary.cheeredPlayerMemo && (
										<p className="text-gray-600 text-sm mb-4">
											{diary.cheeredPlayerMemo}
										</p>
									)}
								</div>

								{/* 스탯 그룹별 표시 */}
								<div className="grid gap-4 md:grid-cols-2">
									{Object.entries(
										statMeta.reduce((acc, meta) => {
											if (!acc[meta.group]) {
												acc[meta.group] = [];
											}
											acc[meta.group].push(meta);
											return acc;
										}, {} as Record<string, typeof statMeta>)
									).map(([groupName, metas]) => {
										const hasData = metas.some((m) => {
											const value =
												m.key === "pts"
													? diary.cheeredPlayerPoints
													: m.key === "fg2Made"
													? diary.cheeredPlayerTwoPointMade
													: m.key === "fg2Att"
													? undefined // 시도는 백엔드에 없을 수 있음
													: m.key === "fg3Made"
													? diary.cheeredPlayerThreePointMade
													: m.key === "fg3Att"
													? undefined
													: m.key === "rebOff"
													? undefined
													: m.key === "rebDef"
													? undefined
													: m.key === "ast"
													? diary.cheeredPlayerAssists
													: m.key === "stl"
													? undefined
													: m.key === "blk"
													? diary.cheeredPlayerBlocks
													: m.key === "to"
													? diary.cheeredPlayerTurnovers
													: undefined;
											return value !== undefined && value !== null;
										});

										if (!hasData) return null;

										return (
											<div
												key={groupName}
												className="bg-white rounded-lg border border-gray-200 p-4"
											>
												<div className="text-sm font-semibold mb-3">
													{groupName}
												</div>
												<div className="grid grid-cols-2 gap-3">
													{metas.map((m) => {
														const value =
															m.key === "pts"
																? diary.cheeredPlayerPoints
																: m.key === "fg2Made"
																? diary.cheeredPlayerTwoPointMade
																: m.key === "fg3Made"
																? diary.cheeredPlayerThreePointMade
																: m.key === "ast"
																? diary.cheeredPlayerAssists
																: m.key === "blk"
																? diary.cheeredPlayerBlocks
																: m.key === "to"
																? diary.cheeredPlayerTurnovers
																: undefined;

														if (value === undefined || value === null)
															return null;

														return (
															<div key={m.key} className="space-y-1">
																<div className="text-xs text-gray-500">
																	{m.label}
																</div>
																<div className="font-medium">{value}</div>
															</div>
														);
													})}
												</div>
											</div>
										);
									})}
								</div>

								{/* 야투율 표시 */}
								{(fg2Percent !== null || fg3Percent !== null) && (
									<div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
										<div className="text-sm font-semibold mb-2">
											야투율 (자동 계산)
										</div>
										<div className="grid grid-cols-2 gap-4">
											{fg2Percent !== null && (
												<div>
													<span className="text-xs text-gray-500">
														2점 야투율
													</span>
													<div className="font-medium">{fg2Percent}%</div>
												</div>
											)}
											{fg3Percent !== null && (
												<div>
													<span className="text-xs text-gray-500">
														3점 야투율
													</span>
													<div className="font-medium">{fg3Percent}%</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* 사진 */}
					{diary.photoUrls && diary.photoUrls.length > 0 && (
						<div className="mb-8 border-b pb-6">
							<h2 className="text-xl font-semibold mb-4">📷 사진</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{diary.photoUrls.map((url, index) => (
									<div key={index} className="relative aspect-square">
										<Image
											src={url}
											alt={`일지 사진 ${index + 1}`}
											fill
											className="object-cover rounded-lg"
										/>
									</div>
								))}
							</div>
						</div>
					)}

					{/* 내용/메모 */}
					{diary.content && (
						<div className="mb-8">
							<h2 className="text-xl font-semibold mb-4">✍️ 메모</h2>
							<div className="bg-gray-50 rounded-lg p-4">
								<p className="whitespace-pre-wrap text-gray-700">
									{diary.content}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>

			<AlertModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				message={modalMessage}
			/>
		</div>
	);
}
