import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

const UnityGame: React.FC = () => {
	// Unity WebGL 빌드를 불러오는 useUnityContext 훅 사용
	const { unityProvider, loadingProgression, isLoaded } = useUnityContext({
		loaderUrl: "/Build/sohee_run.loader.js",
		dataUrl: "/Build/sohee_run.data",
		frameworkUrl: "/Build/sohee_run.framework.js", // '.br' 확장자 없이 사용
		codeUrl: "/Build/sohee_run.wasm", // '.br' 확장자 없이 사용
		streamingAssetsUrl: "StreamingAssets",
		companyName: "MyCompany",
		productName: "MyProduct",
		productVersion: "1.0",
	});

	return (
		<div>
			{/* 로딩 중일 때 진행률을 표시 */}
			{!isLoaded && <p>Loading... {Math.round(loadingProgression * 100)}%</p>}

			{/* Unity WebGL이 렌더링될 캔버스 */}
			<div
				id="unityContainer"
				style={{ width: "340px", height: "600px", background: "black" }}
			>
				<Unity
					unityProvider={unityProvider}
					style={{ width: "340px", height: "600px" }}
				/>
			</div>
		</div>
	);
};

export default UnityGame;
