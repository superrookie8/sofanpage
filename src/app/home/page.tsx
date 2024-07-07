"use client";

import Profile from "@/components/profile";
import Stats from "@/components/stats";
import GetPhotos from "@/components/photos";
import Header from "@/components/header";
import { useState } from "react";
import BrickBreakerGame from "@/components/brickbreakergame";

const MainPage: React.FC = () => {
	const [showGame, setShowGame] = useState(false);
	const [gameOver, setGameOver] = useState(false);
	const [currentGame, setCurrentGame] = useState(0);
	const [difficulty, setDifficulty] = useState<string>("normal");
	const totalGames = 5;

	const handleGameOver = (won: boolean) => {
		if (won) {
			if (currentGame + 1 === totalGames) {
				setCurrentGame(0);
				setGameOver(false);
				setShowGame(false);
			} else {
				setCurrentGame(currentGame + 1);
			}
		} else {
			setGameOver(true);
			setShowGame(false);
		}
	};

	const startGame = () => {
		setGameOver(false);
		setShowGame(true);
	};

	const selectDifficulty = (level: string) => {
		setDifficulty(level);
		startGame();
	};

	return (
		<div className="bg-white min-h-screen flex flex-col items-center">
			<Header pathname="" />
			<div className="bg-yellow-300 h-[400px] w-full">여기 메인 사진</div>
			<div className="bg-red-500 h-[50px] w-full text-white flex justify-center items-center">
				프로필
			</div>

			{/* Profile Section */}
			<section className="w-full bg-white mb-4 rounded ">
				<Profile />
			</section>

			<div className="bg-red-500 h-[50px] w-full text-white flex justify-center items-center">
				기록
			</div>

			{/* Stats Section */}
			<section className="w-full bg-white mb-4 rounded ">
				<Stats />
			</section>

			<div className="bg-red-500 h-[50px] w-full text-white flex justify-center items-center">
				사진
			</div>

			{/* Photos Section */}
			<section className="w-full bg-white mb-4 rounded overflow-x-auto">
				<div className="flex flex-wrap justify-center">
					<GetPhotos />
				</div>
			</section>

			<div className="bg-red-500 h-[50px] w-full text-white flex justify-center items-center">
				게임
			</div>
			{/* Game Section */}
			<section className="w-full bg-white mb-4 rounded text-center">
				<div className="font-bold text-black">
					<div>벽돌깨기</div>
					<div>미스터비 구조대</div>
				</div>
				{showGame && (
					<BrickBreakerGame
						onGameOver={handleGameOver}
						currentGame={currentGame}
						difficulty={difficulty}
					/>
				)}
				{!showGame && gameOver && (
					<div className="text-center">
						<p>다시 도전 하시겠습니까?</p>
						<button
							onClick={() => startGame()}
							className="px-4 py-2 bg-blue-500 text-white rounded"
						>
							재시작
						</button>
					</div>
				)}
				{!showGame && !gameOver && (
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
	);
};

export default MainPage;
