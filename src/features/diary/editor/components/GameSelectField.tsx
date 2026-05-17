"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { addMonths, format, parseISO, subMonths } from "date-fns";
import { isAxiosError } from "axios";
import {
	fetchScheduleDetails,
	fetchSchedulesByDateRange,
} from "@/features/games/api";
import type { ScheduleResponse } from "@/features/games/types";
import { locations } from "@/features/games/constants";
import { findExistingDiary } from "@/features/diary/utils/findExistingDiary";
import { getApiErrorMessage } from "@/lib/http/getApiErrorMessage";
import type { BaseInfo } from "../types";
import { SectionTitle } from "./SectionTitle";
import { ExistingDiaryDialog } from "./ExistingDiaryDialog";

interface GameSelectFieldProps {
	base: BaseInfo;
	onChange: (base: BaseInfo) => void;
	locked?: boolean;
}

const formatScheduleLabel = (schedule: ScheduleResponse) => {
	try {
		const date = format(parseISO(schedule.startDateTime), "yyyy.MM.dd HH:mm");
		const homeAway = schedule.location === "Home" ? "홈" : "원정";
		return `${date} vs ${schedule.title} (${homeAway})`;
	} catch {
		return schedule.title;
	}
};

export const GameSelectField: React.FC<GameSelectFieldProps> = ({
	base,
	onChange,
	locked = false,
}) => {
	const router = useRouter();
	const [isResolving, setIsResolving] = useState(false);
	const [existingDiaryId, setExistingDiaryId] = useState<string | null>(null);
	/** 드롭다운 표시용 (중복 일지 모달 시에도 선택 경기 유지) */
	const [selectedScheduleId, setSelectedScheduleId] = useState("");

	const { startISO, endISO } = useMemo(() => {
		const now = new Date();
		const start = subMonths(now, 6);
		const end = addMonths(now, 6);
		return {
			startISO: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
			endISO: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
		};
	}, []);

	const {
		data: allSchedules = [],
		isLoading,
		isError,
		error: schedulesError,
		refetch,
	} = useQuery({
		queryKey: ["games", "schedules", "diary-picker", startISO, endISO],
		queryFn: () => fetchSchedulesByDateRange(startISO, endISO),
		staleTime: 1000 * 60 * 5,
		retry: 2,
	});

	const gameSchedules = useMemo(
		() =>
			allSchedules
				.filter((s) => s.type === "game" || s.type === "specialGame")
				.sort(
					(a, b) =>
						new Date(b.startDateTime).getTime() -
						new Date(a.startDateTime).getTime()
				),
		[allSchedules]
	);

	const selectValue =
		selectedScheduleId || base.scheduleId || "";

	const clearGameSelection = () => {
		setSelectedScheduleId("");
		onChange({
			...base,
			scheduleId: undefined,
			gameId: undefined,
			stadiumId: undefined,
			location: "",
			seatId: undefined,
			seatZone: undefined,
			seatBlock: undefined,
			seatRow: undefined,
			seatNumber: undefined,
		});
	};

	const applyGameSelection = (
		scheduleId: string,
		details: Awaited<ReturnType<typeof fetchScheduleDetails>>
	) => {
		let date = base.date;
		let time = base.time;
		try {
			date = format(parseISO(details.startDateTime), "yyyy-MM-dd");
			time = format(parseISO(details.startDateTime), "HH:mm");
		} catch {
			// 날짜 파싱 실패 시 기존 값 유지
		}

		const isHome = details.location === "Home";
		const locationName =
			details.stadium?.name ||
			(isHome ? locations["부산 사직실내체육관"].name : details.location) ||
			base.location;

		onChange({
			...base,
			scheduleId,
			gameId: details.gameId!,
			date,
			time,
			location: locationName,
			stadiumId: details.stadium?.id,
			seatId: undefined,
			seatZone: undefined,
			seatBlock: undefined,
			seatRow: undefined,
			seatNumber: undefined,
		});
	};

	const handleSelect = async (scheduleId: string) => {
		if (!scheduleId) {
			clearGameSelection();
			return;
		}

		setSelectedScheduleId(scheduleId);
		setIsResolving(true);
		try {
			const details = await fetchScheduleDetails(scheduleId);
			if (!details.gameId) {
				alert(
					"이 경기는 직관일지 작성이 연결되지 않았습니다. 다른 경기를 선택해주세요."
				);
				clearGameSelection();
				return;
			}

			// 같은 경기(gameId)에 대한 일지만 확인 — 날짜만으로 검사하면 다른 경기 일지에 걸림
			const existing = await findExistingDiary({
				gameId: details.gameId,
			});

			if (existing) {
				setExistingDiaryId(existing.diaryId);
				return;
			}

			applyGameSelection(scheduleId, details);
		} catch (err) {
			if (isAxiosError(err) && err.response?.status === 401) {
				alert("로그인이 필요합니다. 다시 로그인한 뒤 경기를 선택해주세요.");
			} else {
				alert(
					getApiErrorMessage(err, "경기 정보를 불러오지 못했습니다. 다시 시도해주세요.")
				);
			}
			clearGameSelection();
		} finally {
			setIsResolving(false);
		}
	};

	const handleConfirmEdit = () => {
		if (existingDiaryId) {
			router.push(`/diary/${existingDiaryId}/edit`);
		}
		setExistingDiaryId(null);
	};

	const handleCancelEdit = () => {
		setExistingDiaryId(null);
		clearGameSelection();
	};

	if (locked && base.gameId) {
		return null;
	}

	return (
		<>
			<ExistingDiaryDialog
				open={!!existingDiaryId}
				onConfirm={handleConfirmEdit}
				onCancel={handleCancelEdit}
			/>
			<div className="bg-white rounded-2xl border border-red-200 p-5">
				<SectionTitle
					icon={<span className="text-xl">🏀</span>}
					title="경기 선택"
					desc="어떤 경기에 대한 일지인지 먼저 선택해주세요."
				/>
				<div className="mt-4 space-y-2">
					<label className="text-sm text-gray-500">경기</label>
					<select
						value={selectValue}
						onChange={(e) => handleSelect(e.target.value)}
						disabled={isLoading || isResolving}
						className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
					>
						<option value="">
							{isLoading || isResolving
								? "경기 목록 불러오는 중..."
								: "경기를 선택하세요"}
						</option>
						{gameSchedules.map((schedule) => (
							<option key={schedule.id} value={schedule.id}>
								{formatScheduleLabel(schedule)}
							</option>
						))}
					</select>
					{isError && (
						<div className="text-sm text-red-600 space-y-1">
							<p>
								경기 목록을 불러오지 못했습니다:{" "}
								{getApiErrorMessage(schedulesError, "네트워크 오류")}
							</p>
							<button
								type="button"
								onClick={() => refetch()}
								className="text-red-700 underline"
							>
								다시 시도
							</button>
						</div>
					)}
					{!isLoading && !isError && gameSchedules.length === 0 && (
						<p className="text-sm text-gray-500">
							선택 가능한 경기가 없습니다. 경기 스케줄을 확인해주세요.
						</p>
					)}
					{base.gameId && (
						<p className="text-sm text-green-700">경기가 선택되었습니다.</p>
					)}
				</div>
			</div>
		</>
	);
};
