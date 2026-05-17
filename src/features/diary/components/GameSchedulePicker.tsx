"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import Calendar from "@/features/games/components/calender";
import GameInfoModal from "@/features/games/components/gameInfoModal";
import { GameLocation } from "@/features/games/types";
import { locations } from "@/features/games/constants";

export function GameSchedulePicker() {
	const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
		null
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [, setSelectedLocation] = useState<GameLocation>(
		locations["부산 사직실내체육관"]
	);

	const handleGameClick = (scheduleId: string) => {
		setSelectedScheduleId(scheduleId);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedScheduleId(null);
	};

	return (
		<div className="w-full min-h-screen">
			<div className="w-full p-4 md:p-8 bg-black bg-opacity-75 min-h-screen">
				<div className="max-w-6xl mx-auto">
					<div className="mb-6 text-white">
						<h1 className="text-2xl font-bold mb-2">작성할 경기 선택</h1>
						<p className="text-gray-300 text-sm md:text-base">
							달력에서 경기를 선택한 뒤, 상세 창에서 직관일지 작성하기를
							눌러주세요.
						</p>
					</div>

					<div className="bg-gray-100 bg-opacity-90 rounded-lg overflow-hidden">
						<Suspense
							fallback={
								<div className="w-full h-[400px] flex items-center justify-center text-gray-600">
									일정 불러오는 중...
								</div>
							}
						>
							<Calendar
								onLocationSelect={setSelectedLocation}
								onGameClick={handleGameClick}
								syncUrl={false}
							/>
						</Suspense>
					</div>

					<div className="mt-6 flex flex-wrap gap-3 justify-center">
						<Link
							href="/diary/read"
							className="px-4 py-2 border border-white text-white rounded-md hover:bg-white hover:text-black transition"
						>
							목록으로
						</Link>
						<Link
							href="/schedule"
							className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
						>
							경기 일정 페이지
						</Link>
					</div>
				</div>
			</div>

			<GameInfoModal
				scheduleId={selectedScheduleId}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</div>
	);
}
