import React, { useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import clientAxiosService from "@/lib/client/http/axiosService";
import { useSession } from "next-auth/react";

// API 응답 타입 정의
interface ScoreResponse {
	userId: string;
	nickname: string;
	profileImageUrl: string;
	bestScore: number | null;
	rank: number | null;
}

interface RankingEntry {
	rank: number;
	userId: string;
	nickname: string;
	profileImageUrl: string;
	bestScore: number;
}

interface RankingResponse {
	rankings: RankingEntry[];
	totalCount: number;
	myRank: number | null;
}

const UnityGame: React.FC = () => {
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";

	// Unity WebGL 빌드를 불러오는 useUnityContext 훅 사용
	const unityContext = useUnityContext({
		loaderUrl: "/Build/sohee_run_2nd.loader.js",
		dataUrl: "/Build/sohee_run_2nd.data",
		frameworkUrl: "/Build/sohee_run_2nd.framework.js", // '.br' 확장자 없이 사용
		codeUrl: "/Build/sohee_run_2nd.wasm", // '.br' 확장자 없이 사용
		streamingAssetsUrl: "StreamingAssets",
		companyName: "MyCompany",
		productName: "MyProduct",
		productVersion: "1.0",
	});

	const { unityProvider, loadingProgression, isLoaded } = unityContext;
	const sendMessage = (unityContext as any).sendMessage as (
		gameObjectName: string,
		methodName: string,
		value?: string | number,
	) => void;

	// API Base URL
	const API_BASE_URL = `/api/arcade`;

	// 백엔드 API 호출: 점수 제출
	const submitScoreToBackend = async (
		score: number,
	): Promise<ScoreResponse | null> => {
		if (!isAuthenticated) {
			console.log("게스트 플레이: 점수를 저장하지 않습니다.");
			return null;
		}

		try {
			const response = await clientAxiosService.post<ScoreResponse>(
				`${API_BASE_URL}/score`,
				{ score },
			);

			console.log("점수 제출 성공:", response.data);
			sendMessage(
				"GameManager",
				"OnScoreReceived",
				JSON.stringify(response.data),
			);
			return response.data;
		} catch (error: any) {
			// 401 에러는 조용히 처리 (로그인 안 된 경우 정상)
			if (error.response?.status === 401) {
				console.log("로그인이 필요하지 않습니다. 점수는 저장되지 않습니다.");
			} else {
				console.error("점수 제출 중 오류:", error);
			}
			return null;
		}
	};

	// 백엔드 API 호출: 내 최고 점수 조회
	const getMyBestScore = async (): Promise<ScoreResponse | null> => {
		if (!isAuthenticated) {
			return null;
		}

		try {
			const response = await clientAxiosService.get<ScoreResponse>(
				`${API_BASE_URL}/my-score`,
			);
			return response.data;
		} catch (error: any) {
			// 401 에러는 조용히 처리 (로그인 안 된 경우 정상)
			if (error.response?.status === 401) {
				// 조용히 처리
			} else {
				console.error("점수 조회 중 오류:", error);
			}
			return null;
		}
	};

	// 백엔드 API 호출: 랭킹 조회
	const getRanking = async (
		limit?: number,
	): Promise<RankingResponse | null> => {
		try {
			const url = limit
				? `${API_BASE_URL}/ranking?limit=${limit}`
				: `${API_BASE_URL}/ranking`;

			const response = await clientAxiosService.get<RankingResponse>(url);
			return response.data;
		} catch (error) {
			console.error("랭킹 조회 중 오류:", error);
			return null;
		}
	};

	// Unity에서 호출할 함수들 (전역으로 등록)
	useEffect(() => {
		// 페이지 이동 등으로 컴포넌트가 사라질 때 Unity의 키보드 독점 강제 해제
		return () => {
			if ((window as any).unityInstance) {
				// Unity 인스턴스가 존재한다면 키보드 입력을 가로채지 않도록 설정
				try {
					(window as any).unityInstance.SetFullscreen(0);
					// 이 부분이 핵심입니다. 브라우저가 키보드 입력을 다시 가져오게 합니다.
					if (typeof (window as any).unityInstance.Quit === "function") {
						// 필요 시 인스턴스 종료 처리
					}
				} catch (e) {
					console.error("Unity cleanup error:", e);
				}
			}
			// 전역 함수 삭제
			delete (window as any).receiveScoreFromUnity;
			delete (window as any).requestMyBestScore;
			delete (window as any).requestRanking;
		};
	}, []);

	useEffect(() => {
		if (!isLoaded) return;

		// Unity가 키보드 입력을 독점하는 것을 방지 (다른 입력창 클릭 시 타이핑 가능하게)
		const canvas = document.querySelector("canvas");
		if (canvas) {
			canvas.addEventListener("click", () => {
				canvas.focus();
			});
			// 브라우저의 다른 요소를 클릭했을 때 Unity 포커스 해제
			window.addEventListener("click", (e) => {
				if (e.target !== canvas) {
					// canvas 외의 다른 곳을 클릭하면 포커스를 다른 곳으로 돌림
				}
			});
		}

		// Unity → Next.js: 점수 전달 받기
		(window as any).receiveScoreFromUnity = async (score: number) => {
			console.log(`Unity에서 점수 받음: ${score}`);
			await submitScoreToBackend(score);
		};

		// Unity → Next.js: 내 최고 점수 요청
		(window as any).requestMyBestScore = async () => {
			console.log("Unity에서 최고 점수 요청");
			const result = await getMyBestScore();

			if (result) {
				sendMessage("GameManager", "OnScoreReceived", JSON.stringify(result));
			}
		};

		// Unity → Next.js: 랭킹 요청
		(window as any).requestRanking = async (limit: number = 10) => {
			console.log(`Unity에서 랭킹 요청: 상위 ${limit}명`);
			const result = await getRanking(limit);

			if (result) {
				sendMessage("GameManager", "OnRankingReceived", JSON.stringify(result));
			}
		};

		// 정리 함수
		return () => {
			delete (window as any).receiveScoreFromUnity;
			delete (window as any).requestMyBestScore;
			delete (window as any).requestRanking;
		};
	}, [isLoaded, sendMessage]);

	// 게임 로드 시 최고 점수 자동 불러오기
	useEffect(() => {
		if (!isLoaded) return;

		const loadInitialBestScore = async () => {
			// Unity가 완전히 준비될 때까지 약간의 지연
			setTimeout(async () => {
				const bestScore = await getMyBestScore();
				if (bestScore) {
					console.log("게임 시작 시 최고 점수 로드:", bestScore);
					sendMessage(
						"GameManager",
						"OnScoreReceived",
						JSON.stringify(bestScore),
					);
				}
			}, 1000); // Unity 초기화 대기 시간
		};

		loadInitialBestScore();
	}, [isLoaded, sendMessage]);

	return (
		<div>
			{/* 로그인하지 않은 사용자를 위한 안내 문구 */}
			{!isAuthenticated && isLoaded && (
				<div
					style={{
						backgroundColor: "#fef3c7",
						borderLeft: "4px solid #f59e0b",
						color: "#92400e",
						padding: "8px",
						marginBottom: "8px",
						fontSize: "12px",
						textAlign: "left",
					}}
				>
					로그인하지 않은 상태입니다. 게스트 플레이 시 점수가 저장되지 않습니다.
				</div>
			)}

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
