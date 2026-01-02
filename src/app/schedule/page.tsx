// src/components/Schedule.tsx
"use client";
import { useEffect } from "react";
import Calendar from "@/components/schedule/calender";
import { locations } from "@/data/schedule";
import Map from "@/components/schedule/kakaoMap";
import { useState } from "react";
import { GameLocation } from "@/data/schedule";
import DirectionsGuide from "@/components/schedule/directionsGuide";

const Schedule: React.FC = () => {
	const [selectedLocation, setSelectedLocation] = useState<GameLocation>(
		locations["부산 사직실내체육관"]
	);

	useEffect(() => {
		const location = locations["부산 사직실내체육관"];
		setSelectedLocation(location);
	}, []);

	return (
		<div className="flex overflow-x-hidden justify-center items-center min-h-screen w-full">
			<div className="flex flex-col justify-center p-4 w-full max-w-screen-lg">
				<div className="flex flex-col  lg:flex-row  md:space-x-4 lg:space-x-4">
					<div className="bg-white w-full  lg:w-1/2 mb-4  lg:mb-0 rounded-lg shadow-lg">
						<Calendar onLocationSelect={setSelectedLocation} />
					</div>

					<div className="bg-white relative w-full  lg:w-1/2  md:h-auto lg:h-auto p-4 rounded-lg shadow-lg">
						<div className="lg:h-[400px] md: h-[400px] sm: h-[200px]">
							<Map selectedLocation={selectedLocation} />
						</div>
						<div className="mt-4 p-4 h-[250px] sm:h-auto border border-red-500 rounded">
							<DirectionsGuide selectedLocation={selectedLocation} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Schedule;
