// src/app/schedule/page.tsx
"use client";
import { useEffect, Suspense } from "react";
import Calendar from "@/features/games/components/calender";
import { locations } from "@/features/games/constants";
import Map from "@/features/games/components/kakaoMap";
import { useState } from "react";
import { GameLocation } from "@/features/games/types";
import DirectionsGuide from "@/features/games/components/directionsGuide";
import GameInfoModal from "@/features/games/components/gameInfoModal";

const Schedule: React.FC = () => {
	const [selectedLocation, setSelectedLocation] = useState<GameLocation>(
		locations["부산 사직실내체육관"]
	);

	const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
		null
	);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		const location = locations["부산 사직실내체육관"];
		setSelectedLocation(location);
	}, []);

	const handleGameClick = (scheduleId: string) => {
		setSelectedScheduleId(scheduleId);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedScheduleId(null);
	};

	return (
		<div className="relative flex justify-center items-start min-h-screen w-full">
			<div className="flex flex-row justify-center items-start p-4 mt-4 w-full h-screen max-w-screen-lg">
				<div className="flex flex-col">
					<div className="bg-gray-100 bg-opacity-80 w-full">
						<Suspense
							fallback={
								<div className="w-full h-[600px] flex items-center justify-center">
									로딩 중...
								</div>
							}
						>
							<Calendar
								onLocationSelect={setSelectedLocation}
								onGameClick={handleGameClick}
							/>
						</Suspense>
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
};

export default Schedule;
