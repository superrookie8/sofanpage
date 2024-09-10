"use client";
import React, { useState } from "react";
import BrickBreakerGame from "@/components/brickbreakergame";
import UnityGame from "@/components/unityGame";

interface Props {}

const Arcade: React.FC<Props> = (props) => {
	const [showBrickBreaker, setShowBrickBreaker] = useState(false);
	const [showUnity, setShowUnity] = useState(false);
	const [brickBreakerGameOver, setBrickBreakerGameOver] = useState(false);
	const [currentGame, setCurrentGame] = useState(0);
	const [difficulty, setDifficulty] = useState<string>("normal");
	const totalGames = 5;

	// 벽돌깨기 게임 종료 핸들러
	const handleBrickBreakerGameOver = (won: boolean) => {
		if (won) {
			if (currentGame + 1 === totalGames) {
				setCurrentGame(0);
				setBrickBreakerGameOver(false);
				setShowBrickBreaker(false);
			} else {
				setCurrentGame(currentGame + 1);
			}
		} else {
			setBrickBreakerGameOver(true);
			setShowBrickBreaker(false);
		}
	};

	// 벽돌깨기 게임 시작
	const startBrickBreaker = () => {
		setBrickBreakerGameOver(false);
		setShowBrickBreaker(true);
	};

	// 난이도 선택 후 벽돌깨기 게임 시작
	const selectDifficulty = (level: string) => {
		setDifficulty(level);
		startBrickBreaker();
	};

	// 유니티 게임 시작
	const startUnity = () => {
		setShowUnity(true);
	};

	const closeTab = () => {
		setShowUnity(false);
	};
	return (
		<div className="flex flex-col md:flex-row  pt-16 pb-16 justify-center p-4 w-full max-w-screen-lg">
			<div className="w-full flex flex-col md:flex-row justify-center items-center z-10">
				<div className="w-full max-w-6xl flex flex-col md:flex-row lg:flex-row gap-4">
					{/* 벽돌깨기 게임 섹션 */}
					<div className="w-full md:w-1/2 lg:w-1/2">
						<div className="bg-white bg-opacity-75 text-red-500 border-b-2 border-t-2 border-red-500 h-[50px] w-full flex justify-center items-center">
							벽돌깨기 게임
						</div>
						<section className="w-full bg-white bg-opacity-75 p-4 mb-4 rounded text-center">
							<div className="font-bold text-black">
								<div>벽돌깨기</div>
							</div>
							{showBrickBreaker && (
								<BrickBreakerGame
									onGameOver={handleBrickBreakerGameOver}
									currentGame={currentGame}
									difficulty={difficulty}
								/>
							)}
							{!showBrickBreaker && brickBreakerGameOver && (
								<div className="text-center">
									<p>다시 도전 하시겠습니까?</p>
									<button
										onClick={() => startBrickBreaker()}
										className="px-4 py-2 bg-blue-500 text-white rounded m-2"
									>
										재시작
									</button>
								</div>
							)}
							{!showBrickBreaker && !brickBreakerGameOver && (
								<div className="text-center">
									<p>난이도를 선택하세요:</p>
									<button
										onClick={() => selectDifficulty("easy")}
										className="px-4 py-2 bg-green-500 text-white rounded m-2"
									>
										쉬움
									</button>
									<button
										onClick={() => selectDifficulty("hard")}
										className="px-4 py-2 bg-red-500 text-white rounded m-2"
									>
										어려움
									</button>
								</div>
							)}
						</section>
					</div>

					{/* 유니티 게임 섹션 */}
					<div className="w-full md:w-1/2 lg:w-1/2">
						<div className="bg-white bg-opacity-75 text-red-500 border-b-2 border-t-2 border-red-500 h-[50px] w-full flex justify-center items-center">
							탄막슈팅 게임
						</div>
						<section className="w-full flex flex-col justify-center items-center bg-white bg-opacity-75 p-4 mb-4 rounded text-center">
							<div className="font-bold text-black">
								<div>달려라 슈퍼소히</div>
							</div>
							<div className="text-center">
								<p>난이도 자동</p>
							</div>
							{showUnity && (
								<div className="flex flex-col justify-center items-center">
									<button
										onClick={() => closeTab()}
										className="px-4 py-2 bg-red-500 text-white rounded m-2"
									>
										게임끄기
									</button>

									<UnityGame />
								</div>
							)}
							{!showUnity && (
								<button
									onClick={() => startUnity()}
									className="px-4 py-2 bg-red-500 text-white rounded m-2"
								>
									시작하기
								</button>
							)}
						</section>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Arcade;
