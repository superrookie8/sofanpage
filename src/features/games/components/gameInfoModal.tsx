"use client";
import React, { useMemo, useState } from "react";
import { ScheduleDetailsResponse, GameLocation } from "../types";
import { useRouter } from "next/navigation";
import Map from "./kakaoMap";
import { format, parseISO } from "date-fns";
import { useScheduleDetailsQuery } from "../queries";
import { locations } from "../constants";
import { useDiaryCheckByGameIdQuery } from "@/features/diary/queries";
import { useSession } from "next-auth/react";
import { ExistingDiaryDialog } from "@/features/diary/editor/components/ExistingDiaryDialog";

// 타임존 정보가 없는 ISO 문자열을 한국 시간대(KST)로 정규화하는 헬퍼 함수
const normalizeToKST = (isoString: string): string => {
	// 타임존 정보가 있는지 확인 (Z 또는 +09:00 같은 형식)
	if (isoString.includes("Z") || isoString.match(/[+-]\d{2}:\d{2}$/)) {
		// 타임존 정보가 있으면 그대로 반환
		return isoString;
	}

	// 타임존 정보가 없으면 한국 시간대(KST, UTC+9)로 명시적으로 변환
	// 예: "2025-11-16T14:00:00" → "2025-11-16T14:00:00+09:00"
	return `${isoString}+09:00`;
};

// 정규화된 ISO 문자열을 Date 객체로 파싱
const parseKSTDate = (isoString: string): Date => {
	const normalized = normalizeToKST(isoString);
	return parseISO(normalized);
};

interface GameInfoModalProps {
	scheduleId: string | null;
	isOpen: boolean;
	onClose: () => void;
}

const GameInfoModal: React.FC<GameInfoModalProps> = ({
	scheduleId,
	isOpen,
	onClose,
}) => {
	const router = useRouter();
	const { data: session } = useSession();
	const [existingDiaryId, setExistingDiaryId] = useState<string | null>(null);

	const {
		data: scheduleDetailsRaw,
		isLoading,
		error,
	} = useScheduleDetailsQuery(scheduleId, isOpen);

	// 프론트엔드에서 받은 데이터를 KST로 정규화
	const scheduleDetails = useMemo(() => {
		if (!scheduleDetailsRaw) return null;

		return {
			...scheduleDetailsRaw,
			// 날짜를 KST로 명시적으로 정규화
			startDateTime: normalizeToKST(scheduleDetailsRaw.startDateTime),
			endDateTime: normalizeToKST(scheduleDetailsRaw.endDateTime),
		};
	}, [scheduleDetailsRaw]);

	const stadiumLocation = useMemo(() => {
		if (!scheduleDetails) return null;

		// 백엔드에서 좌표가 있으면 사용
		if (
			scheduleDetails.stadium?.latitude &&
			scheduleDetails.stadium?.longitude
		) {
			return {
				name: scheduleDetails.stadium.name,
				latitude: scheduleDetails.stadium.latitude,
				longitude: scheduleDetails.stadium.longitude,
			} as GameLocation;
		}

		// 백엔드에서 좌표가 없으면 location 기반으로 로컬 상수에서 찾기
		const isHome = scheduleDetails.location === "Home";
		const locationKey = isHome ? "부산 사직실내체육관" : scheduleDetails.title;

		const location = locations[locationKey];
		if (!location) {
			return null;
		}

		return location;
	}, [scheduleDetails]);

	// scheduleDetails가 있어야 gameId를 알 수 있음
	const gameId = scheduleDetails?.gameId ?? null;
	// 로그인한 사용자에게만 일지 조회 (로그인하지 않은 사용자는 모달을 볼 수 있어야 함)
	const { data: diaryCheck, isLoading: isDiaryLoading } =
		useDiaryCheckByGameIdQuery(gameId, isOpen && !!gameId && !!session);

	if (!isOpen) return null;

	const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleCreateDiary = () => {
		if (!gameId) {
			router.push("/diary/create");
			return;
		}
		if (diaryCheck?.exists && diaryCheck.diaryId) {
			setExistingDiaryId(diaryCheck.diaryId);
			return;
		}
		router.push(`/diary/create?gameId=${encodeURIComponent(gameId)}`);
	};

	const handleConfirmEdit = () => {
		if (existingDiaryId) {
			onClose();
			router.push(`/diary/${existingDiaryId}/edit`);
		}
		setExistingDiaryId(null);
	};

	const handleCancelEdit = () => {
		setExistingDiaryId(null);
	};

	const formatDateTime = (dateTime: string) => {
		try {
			// 한국 시간대(KST)로 명시적으로 파싱
			const date = parseKSTDate(dateTime);
			return format(date, "yyyy년 MM월 dd일 HH:mm");
		} catch {
			return dateTime;
		}
	};

	return (
		<>
			<ExistingDiaryDialog
				open={!!existingDiaryId}
				onConfirm={handleConfirmEdit}
				onCancel={handleCancelEdit}
			/>
			<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50"
			onClick={handleOutsideClick}
		>
			<div
				className="relative bg-white rounded-lg shadow-xl overflow-y-auto box-border"
				style={{
					width: "500px",
					height: "650px",
					maxWidth: "95vw",
					maxHeight: "90vh",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* 닫기 버튼 */}
				<button
					className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 hover:text-gray-700 text-3xl md:text-2xl font-bold z-10 w-10 h-10 md:w-auto md:h-auto flex items-center justify-center"
					onClick={onClose}
					aria-label="닫기"
				>
					&times;
				</button>

				{/* 모달 내용 */}
				<div className="p-4 md:p-6 box-border overflow-hidden">
					{isLoading ? (
						<div className="flex items-center justify-center h-full min-h-[300px] md:min-h-[500px]">
							<div className="text-base md:text-lg">로딩 중...</div>
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center h-full min-h-[300px] md:min-h-[500px]">
							<div className="text-red-500 mb-4 text-sm md:text-base px-4 text-center">
								{error instanceof Error
									? error.message
									: "스케줄 상세 정보를 불러올 수 없습니다."}
							</div>
						</div>
					) : scheduleDetails ? (
						<>
							{/* 일정 정보 */}
							<div className="mb-4 md:mb-6">
								<h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 pr-8">
									vs {scheduleDetails.title} (
									{scheduleDetails.location === "Home" ? "BNK 홈 경기" : "원정"}
									)
								</h2>
								{scheduleDetails.description && (
									<p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
										{scheduleDetails.description}
									</p>
								)}
								<div className="space-y-2">
									<p className="text-sm md:text-base">
										<span className="font-semibold">경기 시작:</span>{" "}
										{formatDateTime(scheduleDetails.startDateTime)}
									</p>
								</div>
							</div>

							{/* 경기장 정보 */}
							{scheduleDetails.stadium && (
								<>
									{/* 지도 */}
									{stadiumLocation && (
										<div className="mb-4 md:mb-6">
											<h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
												🗺️ 경기장 위치
											</h2>
											<div className="w-full h-[200px] md:h-[300px] rounded-lg overflow-hidden border border-gray-300">
												<Map
													selectedLocation={stadiumLocation}
													mapId="game-info-modal-map"
												/>
											</div>
										</div>
									)}

									{/* 경기장 상세 정보 */}
									<div className="mb-4 md:mb-6">
										<h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
											경기장 정보
										</h2>
										<div className="space-y-2 md:space-y-3">
											<p className="text-sm md:text-base">
												<span className="font-semibold">경기장:</span>{" "}
												{scheduleDetails.stadium.name}
											</p>
											<p className="text-sm md:text-base">
												<span className="font-semibold">주소:</span>{" "}
												{scheduleDetails.stadium.address}
											</p>
											<p className="text-sm md:text-base">
												<span className="font-semibold">수용인원:</span>{" "}
												{scheduleDetails.stadium.capacity.toLocaleString()}석
											</p>
										</div>
									</div>

									{/* 교통정보 */}
									<div className="mb-4 md:mb-6">
										<h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
											🚇 교통정보
										</h2>
										<div className="space-y-2 md:space-y-3">
											{scheduleDetails.stadium.subwayInfo &&
												scheduleDetails.stadium.subwayInfo.length > 0 && (
													<div>
														<p className="font-semibold mb-1 text-sm md:text-base">
															지하철:
														</p>
														<ul className="text-xs md:text-sm bg-gray-100 p-2 md:p-3 rounded list-disc list-inside">
															{scheduleDetails.stadium.subwayInfo.map(
																(info, index) => (
																	<li key={index}>{info}</li>
																)
															)}
														</ul>
													</div>
												)}
											{scheduleDetails.stadium.busInfo &&
												scheduleDetails.stadium.busInfo.length > 0 && (
													<div>
														<p className="font-semibold mb-1 text-sm md:text-base">
															버스:
														</p>
														<ul className="text-xs md:text-sm bg-gray-100 p-2 md:p-3 rounded list-disc list-inside">
															{scheduleDetails.stadium.busInfo.map(
																(info, index) => (
																	<li key={index}>{info}</li>
																)
															)}
														</ul>
													</div>
												)}
											{scheduleDetails.stadium.intercityRoute && (
												<div>
													<p className="font-semibold mb-1 text-sm md:text-base">
														시외교통:
													</p>
													<p className="text-xs md:text-sm whitespace-pre-line bg-gray-100 p-2 md:p-3 rounded">
														{scheduleDetails.stadium.intercityRoute}
													</p>
												</div>
											)}
										</div>
									</div>
								</>
							)}

							{/* 직관일지 버튼 (gameId가 있으면 보러가기, 없으면 작성하기) */}
							<div className="mt-4 md:mt-6">
								<button
									onClick={handleCreateDiary}
									className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 md:py-3 px-4 rounded-lg transition-colors text-sm md:text-base"
								>
									{!gameId
										? "직관일지 작성하기"
										: !session
										? "직관일지 작성하기"
										: isDiaryLoading
										? "직관일지 확인 중..."
										: diaryCheck?.exists
										? "직관일지 수정하기"
										: "직관일지 작성하기"}
								</button>
							</div>
						</>
					) : null}
				</div>
			</div>
		</div>
		</>
	);
};

export default GameInfoModal;
