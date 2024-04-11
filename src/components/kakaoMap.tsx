import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { selectedLocationState } from "@/states/locationState";

declare global {
	interface Window {
		kakao: any;
	}
}

const Map = () => {
	const selectedLocation = useRecoilValue(selectedLocationState);

	useEffect(() => {
		// 스크립트 로딩 및 지도 초기화
		const loadScript = () => {
			const script = document.createElement("script");
			script.async = true;
			script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&autoload=false&libraries=services`;
			document.head.appendChild(script);

			script.onload = () => {
				window.kakao.maps.load(() => {
					console.log("Kakao Maps is ready");
					if (!selectedLocation) return;

					const container = document.getElementById("map");
					const options = {
						center: new window.kakao.maps.LatLng(
							selectedLocation.latitude,
							selectedLocation.longitude
						),
						level: 3,
					};
					const map = new window.kakao.maps.Map(container, options);

					// 마커 추가
					new window.kakao.maps.Marker({
						map: map,
						position: new window.kakao.maps.LatLng(
							selectedLocation.latitude,
							selectedLocation.longitude
						),
					});

					// 지도 리사이즈 및 중심 재조정
					window.kakao.maps.event.addListener(map, "tilesloaded", () => {
						map.relayout();
						map.setCenter(
							new window.kakao.maps.LatLng(
								selectedLocation.latitude,
								selectedLocation.longitude
							)
						);
					});
				});
			};
		};

		loadScript();

		// 컴포넌트 언마운트 시 스크립트 제거
		return () => {
			const kakaoScript = document.querySelector("script[src*='kakao']");
			if (kakaoScript) {
				document.head.removeChild(kakaoScript);
			}
		};
	}, [selectedLocation]);

	return <div id="map" className="w-full h-full"></div>;
};

export default Map;
