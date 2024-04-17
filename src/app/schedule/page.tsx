"use client";
import { useEffect } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
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
			<Header pathname="" />
			<div className="flex justify-center items-center">
				<div className="bg-red-500  min-h-screen w-full flex justify-center p-8 relative">
					<Sidebar />
					<div className=" min-w-[1200px] flex">
						<div className="bg-red-300 h-[660px]">
							<Calendar />
						</div>
						<div className="bg-white w-[500px] h-[660px] relative">
							<Map />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Schedule;
