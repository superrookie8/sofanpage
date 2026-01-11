"use client";
import DiaryPhotoUpload from "@/components/diary/diaryPhotoUpload";
import React, { FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import WinningToggleMenu from "@/components/diary/winningToggle";
import SelectedWinningMode from "@/components/diary/selectedWinLose";
import { useRouter } from "next/navigation";
import DiaryTabs from "@/components/diary/diaryTabs";
import useAuth from "@/features/auth/hooks/useAuth";
import AlertModal from "@/shared/ui/alertModal";
import { DiaryPhotoData } from "@/states/diaryPhotoPreview";
import { useSession } from "next-auth/react";
import { useCreateDiaryMutation } from "@/features/diary/mutations";
import type { CreateDiaryRequest } from "@/features/diary/types";

interface Stadium {
	id: string;
	name: string;
	address: string;
	capacity: number;
	latitude: number;
	longitude: number;
	imageUrl?: string;
	subwayInfo?: string[];
	busInfo?: string[];
	intercityRoute?: string;
}

// 계층 구조 인터페이스
interface RowInfo {
	row: string; // "A열", "3열", "1열" 등
	numbers: string[]; // ["1번", "2번", ...]
}

interface BlockInfo {
	blockName: string;
	rows: RowInfo[];
}

interface ZoneInfo {
	zoneName: string;
	seatType: string;
	floor: string | null;
	blocks: BlockInfo[] | null; // 블럭이 있으면 blocks, 없으면 null
	rows: RowInfo[] | null; // 블럭이 없으면 rows
}

interface SeatHierarchyResponse {
	zones: ZoneInfo[];
}

// Define DiaryPhotoData if it's not already defined

interface Props {}

const BasketballDiary: React.FC<Props> = (props) => {
	const { data: session } = useSession();
	const [ticketphoto, setTicketPhoto] = useState<string[]>([]); // R2 키 배열
	const [viewphoto, setViewPhoto] = useState<string[]>([]); // R2 키 배열
	const [additionalphoto, setAdditionalPhoto] = useState<string[]>([]); // R2 키 배열
	const [date, setDate] = useState<string>("");
	const [together, setTogether] = useState<string>("");
	const [watchType, setWatchType] = useState<"DIRECT" | "HOUSE">("DIRECT");
	const [isWinning, setIsWinning] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [selectedStadium, setSelectedStadium] = useState<string>("");
	const [stadiums, setStadiums] = useState<Stadium[]>([]);
	const [stadiumsLoading, setStadiumsLoading] = useState<boolean>(true);
	const [hierarchy, setHierarchy] = useState<SeatHierarchyResponse | null>(
		null
	);
	const [hierarchyLoading, setHierarchyLoading] = useState<boolean>(false);

	// 좌석 선택 상태
	const [selectedZone, setSelectedZone] = useState<string>("");
	const [selectedBlock, setSelectedBlock] = useState<string>("");
	const [selectedRow, setSelectedRow] = useState<string>("");
	const [selectedNumber, setSelectedNumber] = useState<string>("");
	const [seatId, setSeatId] = useState<string>("");

	const [preview, setPreview] = useState<DiaryPhotoData[]>([]);

	const user = useAuth();
	const router = useRouter(); // 페이지 이동을 위한 Router
	const createDiaryMutation = useCreateDiaryMutation();

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
		r2Key: string,
		type: "ticket" | "view" | "additional"
	) => {
		// 각 타입별로 1장만 저장 (기존 이미지 교체 또는 제거)
		if (type === "ticket") {
			setTicketPhoto(r2Key ? [r2Key] : []);
		} else if (type === "view") {
			setViewPhoto(r2Key ? [r2Key] : []);
		} else if (type === "additional") {
			setAdditionalPhoto(r2Key ? [r2Key] : []);
		}
		if (r2Key) {
			console.log(`${type} photo uploaded (R2 key):`, r2Key);
		} else {
			console.log(`${type} photo removed`);
		}
	};

	useEffect(() => {
		const today = new Date();
		setDate(format(today, "yyyy-MM-dd"));
	}, []);

	// 경기장 목록 가져오기
	useEffect(() => {
		const fetchStadiums = async () => {
			setStadiumsLoading(true);
			try {
				const response = await fetch("/api/stadiums");
				if (response.ok) {
					const data = await response.json();
					console.log("경기장 목록:", data);
					setStadiums(Array.isArray(data) ? data : []);
				} else {
					const errorData = await response.json();
					console.error("경기장 목록 가져오기 실패:", errorData);
					setStadiums([]);
				}
			} catch (error) {
				console.error("경기장 목록 가져오기 실패:", error);
				setStadiums([]);
			} finally {
				setStadiumsLoading(false);
			}
		};
		fetchStadiums();
	}, []);

	// 경기장 선택 시 좌석 계층 구조 가져오기
	useEffect(() => {
		const fetchHierarchy = async () => {
			if (!selectedStadium) {
				setHierarchy(null);
				resetSeatSelection();
				setHierarchyLoading(false);
				return;
			}
			setHierarchyLoading(true);
			try {
				// 경기장 ID 사용
				const response = await fetch(
					`/api/stadiums/${selectedStadium}/seats/hierarchy`
				);
				if (response.ok) {
					const data = await response.json();
					console.log("좌석 계층 구조:", data);
					setHierarchy(data);
				} else {
					const errorData = await response.json();
					console.error("좌석 계층 구조 가져오기 실패:", errorData);
					setHierarchy(null);
				}
			} catch (error) {
				console.error("좌석 계층 구조 가져오기 실패:", error);
				setHierarchy(null);
			} finally {
				setHierarchyLoading(false);
			}
		};
		fetchHierarchy();
	}, [selectedStadium]);

	// 좌석 선택 초기화 함수
	const resetSeatSelection = () => {
		setSelectedZone("");
		setSelectedBlock("");
		setSelectedRow("");
		setSelectedNumber("");
		setSeatId("");
	};

	// 선택한 구역 정보 가져오기
	const getSelectedZoneInfo = (): ZoneInfo | null => {
		if (!hierarchy || !selectedZone) return null;
		return (
			hierarchy.zones.find((zone) => zone.zoneName === selectedZone) || null
		);
	};

	// 선택한 블럭 정보 가져오기
	const getSelectedBlockInfo = (): BlockInfo | null => {
		const zoneInfo = getSelectedZoneInfo();
		if (!zoneInfo || !zoneInfo.blocks || !selectedBlock) return null;
		return (
			zoneInfo.blocks.find((block) => block.blockName === selectedBlock) || null
		);
	};

	// 선택한 열 정보 가져오기
	const getSelectedRowInfo = (): RowInfo | null => {
		const zoneInfo = getSelectedZoneInfo();
		if (!zoneInfo) return null;

		// 블럭이 있는 경우
		if (zoneInfo.blocks) {
			const blockInfo = getSelectedBlockInfo();
			if (!blockInfo || !selectedRow) return null;
			return blockInfo.rows.find((row) => row.row === selectedRow) || null;
		}
		// 블럭이 없는 경우
		if (zoneInfo.rows && selectedRow) {
			return zoneInfo.rows.find((row) => row.row === selectedRow) || null;
		}
		return null;
	};

	// 모든 선택이 완료되면 최종 좌석 ID 조회 (직관일 때만)
	useEffect(() => {
		// 집관일 때는 좌석 선택 불필요
		if (watchType === "HOUSE") {
			setSeatId("");
			return;
		}

		const fetchSeatId = async () => {
			if (
				!selectedStadium ||
				!selectedZone ||
				!selectedRow ||
				!selectedNumber
			) {
				setSeatId("");
				return;
			}

			try {
				const queryParams = new URLSearchParams({
					zoneName: selectedZone,
					row: selectedRow,
					number: selectedNumber,
				});
				if (selectedBlock) {
					queryParams.append("blockName", selectedBlock);
				}

				// 경기장 ID 사용
				const response = await fetch(
					`/api/stadiums/${selectedStadium}/seat?${queryParams.toString()}`
				);
				if (response.ok) {
					const data = await response.json();
					console.log("좌석 ID 응답:", data);
					// API 라우트에서 문자열로 반환하므로 그대로 사용
					const id = typeof data === "string" ? data : String(data);
					setSeatId(id);
				} else {
					if (response.status === 404) {
						console.error("좌석을 찾을 수 없습니다");
						setSeatId("");
						return;
					}
					const errorData = await response.json();
					console.error("좌석 ID 조회 실패:", errorData);
					setSeatId("");
				}
			} catch (error) {
				console.error("좌석 ID 조회 실패:", error);
				setSeatId("");
			}
		};
		fetchSeatId();
	}, [
		watchType,
		selectedStadium,
		selectedZone,
		selectedBlock,
		selectedRow,
		selectedNumber,
	]);

	const handleDateChange = (event: FormEvent<HTMLInputElement>) => {
		const selectedDate = new Date(event.currentTarget.value);
		setDate(format(selectedDate, "yyyy-MM-dd"));
	};

	const onChangeMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(event.currentTarget.value);
	};

	// POST 데이터 전송 함수
	const postData = async (): Promise<void> => {
		if (!session?.user) {
			handleOpenModal("로그인 해주세요.");
			return;
		}

		console.log("Current ticket photos:", ticketphoto);
		console.log("Current view photos:", viewphoto);

		setIsLoading(true); // Start loading

		try {
			// 이미 업로드된 R2 키들을 합침
			const photoUrls = [...ticketphoto, ...viewphoto, ...additionalphoto];

			// 2. 백엔드 API 형식에 맞게 데이터 변환
			// win_status를 gameWinner로 변환
			const gameWinner =
				isWinning === "WIN" || isWinning === "승"
					? "HOME"
					: isWinning === "LOSE" || isWinning === "패"
					? "AWAY"
					: undefined;

			// 백엔드 요청 Body 생성
			const diaryData: CreateDiaryRequest = {
				gameId: "", // TODO: 게임 선택 UI 추가 필요
				watchType: watchType,
				content: message,
				photoUrls: photoUrls,
			};

			// 직관일 때만 seatId 포함
			if (watchType === "DIRECT" && seatId) {
				diaryData.seatId = seatId;
			}

			// 선택적 필드 추가
			if (gameWinner) {
				diaryData.gameWinner = gameWinner;
			}
			// companion은 user-id 배열이므로 나중에 추가 필요
			// 선수 스탯들도 나중에 추가 필요

			// 3. React Query Mutation 사용
			await createDiaryMutation.mutateAsync(diaryData);

			handleOpenModal("일지가 성공적으로 추가되었습니다");

			// 성공 후 상태 초기화
			setTicketPhoto([]);
			setViewPhoto([]);
			setAdditionalPhoto([]);
			const today = new Date();
			setDate(format(today, "yyyy-MM-dd"));
			setTogether("");
			setWatchType("DIRECT");
			setIsWinning("");
			setMessage("");
			setSelectedStadium("");
			resetSeatSelection();
			setPreview([]);
		} catch (error) {
			console.error("일지 등록중 오류 발생:", error);
			handleOpenModal(
				error instanceof Error
					? error.message
					: "일지를 등록하는 동안 오류가 발생했습니다."
			);
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	return (
		<div className="relative pl-4 pr-4 gap-4 flex flex-col md:flex-col lg:flex-col xl:flex-row 2xl:flex-row justify-center items-center w-full rounded">
			<div className="w-1/2 sm:w-full md:w-full lg:w-full h-[700px] sm:pt-8 sm:h-[1700px] sm:justify-between bg-gray-200 bg-opacity-75 rounded flex flex-col justify-center items-center">
				<div className="w-full h-50 gap-4 flex flex-col">
					{" "}
					{/* gap-2를 gap-4로 변경 */}
					<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row w-full gap-4">
						<div className="w-full md:w-1/3 lg:w-1/3 xl:w-1/3 2xl:w-1/3 h-15 p-4 sm:p-0 flex flex-col">
							<label htmlFor="datePicker" className="flex w-full">
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
							<label className="flex w-full ml-8 mt-2">경기장</label>
							{stadiumsLoading ? (
								<div className="w-full p-2 text-gray-500 text-sm">
									경기장 목록 로딩 중...
								</div>
							) : (
								<select
									value={selectedStadium}
									onChange={(e) => {
										console.log("경기장 선택:", e.target.value);
										setSelectedStadium(e.target.value);
										resetSeatSelection();
									}}
									className="w-full p-2 border rounded bg-white cursor-pointer relative z-50"
									style={{
										WebkitAppearance: "menulist",
										MozAppearance: "menulist",
										appearance: "menulist",
									}}
								>
									<option value="">경기장 선택</option>
									{stadiums.length > 0 ? (
										stadiums.map((stadium) => (
											<option key={stadium.id} value={stadium.id}>
												{stadium.name}
											</option>
										))
									) : (
										<option value="" disabled>
											경기장 목록이 없습니다
										</option>
									)}
								</select>
							)}
						</div>
						<div className="w-full md:w-1/3 h-15 flex flex-col justify-between items-center relative z-50">
							<label className="flex w-full ml-8 mt-2">관람 방식</label>
							<select
								value={watchType}
								onChange={(e) =>
									setWatchType(e.target.value as "DIRECT" | "HOUSE")
								}
								className="w-full p-2 border rounded bg-white cursor-pointer relative z-50"
								style={{
									WebkitAppearance: "menulist",
									MozAppearance: "menulist",
									appearance: "menulist",
								}}
							>
								<option value="DIRECT">직관</option>
								<option value="HOUSE">집관</option>
							</select>
						</div>
					</div>
					<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row gap-4">
						<div className="w-full md:w-1/3 h-15 flex flex-col justify-between items-center relative z-50">
							<label className="flex w-full ml-8 mt-2">함께 본 사람</label>
							<input
								type="text"
								value={together}
								onChange={(e) => setTogether(e.target.value)}
								placeholder="함께 본 사람을 입력하세요"
								className="w-full p-2 border rounded bg-white relative z-50"
								style={{ pointerEvents: "auto" }}
							/>
						</div>
						<div className="w-full md:w-1/3 h-15 flex flex-col justify-between items-center relative z-20">
							<label className="flex w-full ml-8 mt-2">승패선택</label>
							<div className="w-full flex flex-row justify-center items-center gap-2">
								<div className="w-1/3 flex justify-center items-center">
									<WinningToggleMenu onSelect={setIsWinning} />
								</div>
								<div className="w-2/3 flex justify-center items-center">
									<SelectedWinningMode winningmode={isWinning} />
								</div>
							</div>
						</div>
						<div className="w-full md:w-1/3 h-15 flex flex-col justify-between items-center relative z-50">
							<label className="flex w-full ml-4 mt-2">좌석</label>
							{watchType === "HOUSE" ? (
								<div className="w-full p-2 text-gray-500 text-sm">
									집관은 좌석 선택이 필요 없습니다
								</div>
							) : !selectedStadium ? (
								<div className="w-full p-2 text-gray-500 text-sm">
									경기장을 먼저 선택해주세요
								</div>
							) : hierarchyLoading ? (
								<div className="w-full p-2 text-gray-500 text-sm">
									좌석 정보 로딩 중...
								</div>
							) : !hierarchy || hierarchy.zones.length === 0 ? (
								<div className="w-full p-2 text-gray-500 text-sm">
									좌석 정보가 없습니다
								</div>
							) : (
								<div className="w-full flex flex-col gap-2">
									{/* 구역 선택 */}
									<select
										value={selectedZone}
										onChange={(e) => {
											setSelectedZone(e.target.value);
											setSelectedBlock("");
											setSelectedRow("");
											setSelectedNumber("");
										}}
										className="w-full p-2 border rounded bg-white cursor-pointer relative z-50 text-sm"
										style={{
											WebkitAppearance: "menulist",
											MozAppearance: "menulist",
											appearance: "menulist",
										}}
									>
										<option value="">구역 선택</option>
										{hierarchy.zones.map((zone) => (
											<option key={zone.zoneName} value={zone.zoneName}>
												{zone.zoneName}
											</option>
										))}
									</select>

									{/* 블럭 선택 (블럭이 있는 경우) */}
									{getSelectedZoneInfo()?.blocks &&
										getSelectedZoneInfo()!.blocks!.length > 0 && (
											<select
												value={selectedBlock}
												onChange={(e) => {
													setSelectedBlock(e.target.value);
													setSelectedRow("");
													setSelectedNumber("");
												}}
												className="w-full p-2 border rounded bg-white cursor-pointer relative z-50 text-sm"
												style={{
													WebkitAppearance: "menulist",
													MozAppearance: "menulist",
													appearance: "menulist",
												}}
											>
												<option value="">블럭 선택</option>
												{getSelectedZoneInfo()!.blocks!.map((block) => (
													<option key={block.blockName} value={block.blockName}>
														{block.blockName}
													</option>
												))}
											</select>
										)}

									{/* 열 선택 */}
									{(() => {
										const zoneInfo = getSelectedZoneInfo();
										if (!selectedZone || !zoneInfo) return null;

										// 블럭이 있는 경우: 블럭 선택이 완료되어야 열 선택 표시
										if (zoneInfo.blocks && zoneInfo.blocks.length > 0) {
											if (!selectedBlock) return null;
											const blockInfo = getSelectedBlockInfo();
											if (
												!blockInfo ||
												!blockInfo.rows ||
												blockInfo.rows.length === 0
											)
												return null;
											return (
												<select
													value={selectedRow}
													onChange={(e) => {
														setSelectedRow(e.target.value);
														setSelectedNumber("");
													}}
													className="w-full p-2 border rounded bg-white cursor-pointer relative z-50 text-sm"
													style={{
														WebkitAppearance: "menulist",
														MozAppearance: "menulist",
														appearance: "menulist",
													}}
												>
													<option value="">열 선택</option>
													{blockInfo.rows.map((row) => (
														<option key={row.row} value={row.row}>
															{row.row}
														</option>
													))}
												</select>
											);
										}

										// 블럭이 없는 경우: 구역 선택만으로 열 선택 표시
										if (zoneInfo.rows && zoneInfo.rows.length > 0) {
											return (
												<select
													value={selectedRow}
													onChange={(e) => {
														setSelectedRow(e.target.value);
														setSelectedNumber("");
													}}
													className="w-full p-2 border rounded bg-white cursor-pointer relative z-50 text-sm"
													style={{
														WebkitAppearance: "menulist",
														MozAppearance: "menulist",
														appearance: "menulist",
													}}
												>
													<option value="">열 선택</option>
													{zoneInfo.rows.map((row) => (
														<option key={row.row} value={row.row}>
															{row.row}
														</option>
													))}
												</select>
											);
										}

										return null;
									})()}

									{/* 번호 선택 */}
									{selectedRow && getSelectedRowInfo() && (
										<select
											value={selectedNumber}
											onChange={(e) => setSelectedNumber(e.target.value)}
											className="w-full p-2 border rounded bg-white cursor-pointer relative z-50 text-sm"
											style={{
												WebkitAppearance: "menulist",
												MozAppearance: "menulist",
												appearance: "menulist",
											}}
										>
											<option value="">번호 선택</option>
											{getSelectedRowInfo()!.numbers.map((number) => (
												<option key={number} value={number}>
													{number}
												</option>
											))}
										</select>
									)}
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="w-full mb-2 rounded flex flex-col justify-center sm:justify-between items-center gap-4 p-4 sm:h-[800px]">
					<div className="w-full p-2 rounded flex justify-center">
						<p>사진 업로드 (선택사항)</p>
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
						className={`rounded-lg w-[100px] h-[40px] flex justify-center items-center transition-colors duration-200
        ${
					isLoading ||
					!message ||
					!date ||
					!isWinning ||
					(watchType === "DIRECT" && (!selectedStadium || !seatId))
						? "bg-gray-400 cursor-not-allowed" // 비활성화 상태
						: "bg-red-500 hover:bg-black text-white" // 활성화 상태
				}`}
						onClick={postData}
						disabled={
							isLoading ||
							createDiaryMutation.isPending ||
							!message ||
							!date ||
							!isWinning ||
							(watchType === "DIRECT" && (!selectedStadium || !seatId))
						}
					>
						{isLoading || createDiaryMutation.isPending ? (
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
							<span className="font-medium">올리기</span>
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
