import React, { useState, useEffect } from "react";
import { DirectionInfo, directionguide, GameLocation } from "@/data/schedule";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedLocationState } from "@/states/locationState";

const DirectionsGuide: React.FC = () => {
	const selectedLocation = useRecoilValue(selectedLocationState);
	const [locaInfo, setLocaInfo] = useState<DirectionInfo | undefined>(
		undefined
	);

	useEffect(() => {
		if (selectedLocation && selectedLocation.name) {
			const foundLocation = Object.values(directionguide).find(
				(direction) => direction.name === selectedLocation.name
			);
			if (foundLocation) {
				setLocaInfo(foundLocation);
			} else {
				setLocaInfo(undefined);
			}
		}
	}, [selectedLocation]);

	return (
		<div className="flex w-full sm:flex-col">
            <div className="flex flex-col flex-1 pl-2 mr-4">
			<div className="text-base  mb-2">대중교통 정보</div>
			{locaInfo ? (
				<div className="text-xs">
					<h2>경기장 : {locaInfo.name}</h2>
					<p className="">정보 : {locaInfo.info}</p>
                    <p className="mb-2">수용인원 : {locaInfo.capacity}석</p>
					<p className="wrap-text">bus 하차 시</p>
					<p className="wrap-text mb-2 overflow-y-scroll bg-gray-200" style={{ maxHeight: '60px' }}>{locaInfo.bus}</p>
					<p>지하철 하차 시</p>
					<p className="wrap-text">{locaInfo.subway}</p>
				</div>
			) : null}
            </div>
            <div className="flex flex-col flex-1 sm: mt-4">
            <div>추천경로</div>
            </div>
		</div>
	);
};

export default DirectionsGuide;
