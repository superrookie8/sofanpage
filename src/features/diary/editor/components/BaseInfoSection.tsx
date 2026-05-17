// src/features/diary/editor/components/BaseInfoSection.tsx
import React, { useState, useEffect } from "react";
import { SectionTitle } from "./SectionTitle";
import { Chip } from "./Chip";
import type { BaseInfo } from "../types";
import {
	fetchStadiums,
	fetchSeatHierarchy,
	fetchSeatId,
	type SeatHierarchyResponse,
} from "../api";
import type { StadiumInfo } from "@/features/games/types";

interface BaseInfoSectionProps {
	base: BaseInfo;
	onChange: (base: BaseInfo) => void;
}

/** 경기장 이름으로 목록에서 id 매칭 (스케줄 상세에 stadium.id가 없을 때) */
const resolveStadiumId = (
	stadiums: StadiumInfo[],
	location?: string
): string | undefined => {
	if (!location?.trim()) return undefined;
	const name = location.trim();
	const exact = stadiums.find((s) => s.name === name);
	if (exact) return exact.id;
	return stadiums.find(
		(s) => s.name.includes(name) || name.includes(s.name)
	)?.id;
};

export const BaseInfoSection: React.FC<BaseInfoSectionProps> = ({
	base,
	onChange,
}) => {
	const [stadiums, setStadiums] = useState<StadiumInfo[]>([]);
	const [hierarchy, setHierarchy] = useState<SeatHierarchyResponse | null>(
		null
	);
	const [loadingStadiums, setLoadingStadiums] = useState(false);
	const [loadingHierarchy, setLoadingHierarchy] = useState(false);

	// 경기장 목록 로드
	useEffect(() => {
		const loadStadiums = async () => {
			setLoadingStadiums(true);
			try {
				const data = await fetchStadiums();
				setStadiums(data);
			} catch (error) {
				console.error("경기장 목록 로드 실패:", error);
			} finally {
				setLoadingStadiums(false);
			}
		};
		loadStadiums();
	}, []);

	// 경기 선택 등으로 경기장 이름만 채워진 경우 → stadiumId 매칭 후 좌석 API 호출 가능하게
	useEffect(() => {
		if (base.stadiumId || !base.location?.trim() || stadiums.length === 0) {
			return;
		}
		const matchedId = resolveStadiumId(stadiums, base.location);
		if (matchedId) {
			onChange({ ...base, stadiumId: matchedId });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [base.location, base.stadiumId, stadiums]);

	// 경기장 선택 시 좌석 계층 구조 로드
	useEffect(() => {
		if (!base.stadiumId) {
			setHierarchy(null);
			return;
		}

		const loadHierarchy = async () => {
			setLoadingHierarchy(true);
			try {
				const data = await fetchSeatHierarchy(base.stadiumId!);
				setHierarchy(data);
			} catch (error) {
				console.error("좌석 계층 구조 로드 실패:", error);
				setHierarchy(null);
			} finally {
				setLoadingHierarchy(false);
			}
		};
		loadHierarchy();
	}, [base.stadiumId]);

	// 좌석 선택 완료 시 seatId 가져오기
	useEffect(() => {
		if (
			base.stadiumId &&
			base.seatZone &&
			base.seatRow &&
			base.seatNumber &&
			!base.seatId // 이미 seatId가 있으면 다시 가져오지 않음
		) {
			const loadSeatId = async () => {
				try {
					const seatId = await fetchSeatId(
						base.stadiumId!,
						base.seatZone!,
						base.seatRow!,
						base.seatNumber!,
						base.seatBlock
					);
					onChange({ ...base, seatId });
				} catch (error) {
					console.error("좌석 ID 로드 실패:", error);
				}
			};
			loadSeatId();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		base.stadiumId,
		base.seatZone,
		base.seatBlock,
		base.seatRow,
		base.seatNumber,
	]);
	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-5">
			<SectionTitle
				icon={<span className="text-xl">✨</span>}
				title="경기 기본 정보"
				desc="사실 정보는 빠르게, 핵심 기록은 아래에서 자세히."
			/>
			<div className="mt-5 grid gap-4 md:grid-cols-3">
				<div className="space-y-2">
					<div className="text-sm text-gray-500 flex items-center gap-2">
						<span>📅</span> 날짜
					</div>
					<input
						type="date"
						value={base.date}
						onChange={(e) => onChange({ ...base, date: e.target.value })}
						className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>

				<div className="space-y-2">
					<div className="text-sm text-gray-500 flex items-center gap-2">
						<span>🕐</span> 시간
					</div>
					<input
						type="time"
						value={base.time}
						onChange={(e) => onChange({ ...base, time: e.target.value })}
						className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>

				<div className="space-y-2">
					<div className="text-sm text-gray-500 flex items-center gap-2">
						<span>📍</span> 경기장
					</div>
					<select
						value={base.stadiumId || ""}
						onChange={(e) => {
							const selectedStadium = stadiums.find(
								(s) => s.id === e.target.value
							);
							onChange({
								...base,
								stadiumId: e.target.value || undefined,
								location: selectedStadium?.name || "",
								// 좌석 정보 초기화
								seatId: undefined,
								seatZone: undefined,
								seatBlock: undefined,
								seatRow: undefined,
								seatNumber: undefined,
							});
						}}
						className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
						disabled={loadingStadiums}
					>
						<option value="">경기장을 선택하세요</option>
						{stadiums.map((stadium) => (
							<option key={stadium.id} value={stadium.id}>
								{stadium.name}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<div className="text-sm text-gray-500">관람</div>
					<div className="flex flex-wrap gap-2">
						<Chip
							active={base.watchType === "직관"}
							onClick={() => onChange({ ...base, watchType: "직관" })}
						>
							직관
						</Chip>
						<Chip
							active={base.watchType === "집관"}
							onClick={() => onChange({ ...base, watchType: "집관" })}
						>
							집관
						</Chip>
					</div>
				</div>

				<div className="space-y-2">
					<div className="text-sm text-gray-500 flex items-center gap-2">
						<span>👥</span> 같이 본 사람
					</div>
					<input
						type="text"
						placeholder="예: 친구 1명 / 혼자"
						value={base.companions}
						onChange={(e) => onChange({ ...base, companions: e.target.value })}
						className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>

				<div className="space-y-2">
					<div className="text-sm text-gray-500 flex items-center gap-2">
						<span>🏆</span> 결과
					</div>
					<select
						value={base.result}
						onChange={(e) =>
							onChange({
								...base,
								result: e.target.value as "승" | "패",
							})
						}
						className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					>
						<option value="승">승</option>
						<option value="패">패</option>
					</select>
				</div>

				{/* 좌석 선택 (드롭다운) */}
				{base.watchType === "직관" && (
					<div className="space-y-2 md:col-span-3">
						<div className="text-sm text-gray-500 flex items-center gap-2">
							<span>🎫</span> 좌석
						</div>
						{!base.stadiumId ? (
							<div className="text-xs text-gray-400">
								경기장을 먼저 선택해주세요
							</div>
						) : loadingHierarchy ? (
							<div className="text-xs text-gray-400">
								좌석 정보를 불러오는 중...
							</div>
						) : !hierarchy ||
						  !hierarchy.zones ||
						  hierarchy.zones.length === 0 ? (
							<div className="text-xs text-gray-400">
								좌석 정보를 불러올 수 없습니다
							</div>
						) : (
							<div className="grid gap-3 md:grid-cols-4">
								{/* Zone 선택 */}
								<div className="space-y-2">
									<div className="text-xs text-gray-500">구역</div>
									<select
										value={base.seatZone || ""}
										onChange={(e) => {
											onChange({
												...base,
												seatZone: e.target.value || undefined,
												seatBlock: undefined,
												seatRow: undefined,
												seatNumber: undefined,
												seatId: undefined,
											});
										}}
										className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
									>
										<option value="">구역 선택</option>
										{hierarchy.zones.map((zone) => (
											<option key={zone.zoneName} value={zone.zoneName}>
												{zone.zoneName}
											</option>
										))}
									</select>
								</div>

								{/* Block 선택 (있는 경우만) */}
								{base.seatZone &&
									(() => {
										const selectedZone = hierarchy.zones.find(
											(z) => z.zoneName === base.seatZone
										);
										const hasBlocks =
											selectedZone?.blocks && selectedZone.blocks.length > 0;

										if (hasBlocks) {
											return (
												<div className="space-y-2">
													<div className="text-xs text-gray-500">블록</div>
													<select
														value={base.seatBlock || ""}
														onChange={(e) => {
															onChange({
																...base,
																seatBlock: e.target.value || undefined,
																seatRow: undefined,
																seatNumber: undefined,
																seatId: undefined,
															});
														}}
														className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
													>
														<option value="">블록 선택</option>
														{selectedZone.blocks?.map((block) => (
															<option
																key={block.blockName}
																value={block.blockName}
															>
																{block.blockName}
															</option>
														))}
													</select>
												</div>
											);
										}
										return null;
									})()}

								{/* Row 선택 */}
								{base.seatZone &&
									(() => {
										const selectedZone = hierarchy.zones.find(
											(z) => z.zoneName === base.seatZone
										);
										const rows =
											selectedZone?.blocks && selectedZone.blocks.length > 0
												? selectedZone.blocks.find(
														(b) => b.blockName === base.seatBlock
												  )?.rows || []
												: selectedZone?.rows || [];

										if (rows.length > 0) {
											return (
												<div className="space-y-2">
													<div className="text-xs text-gray-500">열</div>
													<select
														value={base.seatRow || ""}
														onChange={(e) => {
															onChange({
																...base,
																seatRow: e.target.value || undefined,
																seatNumber: undefined,
																seatId: undefined,
															});
														}}
														className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
													>
														<option value="">열 선택</option>
														{rows.map((row) => (
															<option key={row.row} value={row.row}>
																{row.row}
															</option>
														))}
													</select>
												</div>
											);
										}
										return null;
									})()}

								{/* Number 선택 */}
								{base.seatRow &&
									(() => {
										const selectedZone = hierarchy.zones.find(
											(z) => z.zoneName === base.seatZone
										);
										const rows =
											selectedZone?.blocks && selectedZone.blocks.length > 0
												? selectedZone.blocks.find(
														(b) => b.blockName === base.seatBlock
												  )?.rows || []
												: selectedZone?.rows || [];
										const selectedRow = rows.find(
											(r) => r.row === base.seatRow
										);

										if (selectedRow && selectedRow.numbers.length > 0) {
											return (
												<div className="space-y-2">
													<div className="text-xs text-gray-500">번호</div>
													<select
														value={base.seatNumber || ""}
														onChange={(e) => {
															onChange({
																...base,
																seatNumber: e.target.value || undefined,
																seatId: undefined,
															});
														}}
														className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
													>
														<option value="">번호 선택</option>
														{selectedRow.numbers.map((num) => (
															<option key={num} value={num}>
																{num}
															</option>
														))}
													</select>
												</div>
											);
										}
										return null;
									})()}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
