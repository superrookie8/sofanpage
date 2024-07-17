// src/components/Schedule.tsx
"use client";
import { useEffect } from "react";
import Calendar from "@/components/calender";
import { locations } from "@/data/schedule";
import Map from "@/components/kakaoMap";
import { useSetRecoilState } from "recoil";
import { selectedLocationState } from "@/states/locationState";

const Schedule: React.FC = () => {
	const setSelectedLocation = useSetRecoilState(selectedLocationState);

	useEffect(() => {
		const location = locations["부산 사직실내체육관"];
		setSelectedLocation(location);
	}, [setSelectedLocation]);

	return (
		<div>
			<div className="flex justify-center items-center">
				<div className="min-h-screen w-full flex flex-col justify-center p-8">
					<div className="flex flex-col md:flex-row lg:flex-row md:min-w-[800px] lg:min-w-[1200px] md:space-x-4 lg:space-x-4">
						<div className="bg-red-500 w-full md:w-1/2 lg:w-1/2 mb-4 md:mb-0 lg:mb-0 p-4 rounded-lg shadow-lg">
							<Calendar />
						</div>
						<div className="relative bg-red-500 w-full md:w-1/2 lg:w-1/2 h-[400px] md:h-auto lg:h-auto p-4 rounded-lg shadow-lg">
							<Map />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Schedule;
