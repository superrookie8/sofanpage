"use client";

import Profile from "@/components/profile";
import Stats from "@/components/stats";
import GetPhotos from "@/components/photos";
import Header from "@/components/header";
import Image from "next/image";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import BrickBreakerGame from "@/components/brickbreakergame";

const MainPage: React.FC = () => {
	useAuth();
	const [activePage, setActivePage] = useState<string | null>(null);
	const [showGame, setShowGame] = useState(false);
	const [gameOver, setGameOver] = useState(false);
	const [currentGame, setCurrentGame] = useState(0);
	const [difficulty, setDifficulty] = useState<string>("normal");
	const totalGames = 5;

	const togglePage = (page: string) => {
		setActivePage((prevActivePage) => (prevActivePage === page ? null : page));
	};

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
		<div className="bg-red-500 min-h-screen flex flex-col items-center">
			<Header pathname="" />
			<div className="flex justify-center items-center flex-1 w-full">
				<div className="bg-red-500 w-full flex justify-center p-8 relative max-w-[1200px]">
					<div className="flex flex-col relative items-center w-full">
						<div className="w-full flex flex-col items-center">
							<div className="w-full flex items-center justify-between">
								<div
									className="relative w-[70%]"
									style={{
										paddingTop: "70%",
										marginTop: "10%",
										marginBottom: "10%",
									}}
								>
									<Image
										src="/images/leesohee.png"
										alt="Profile Image"
										fill
										style={{ objectFit: "contain" }}
										className="absolute"
									/>
								</div>
								<div className="relative text-center font-bold text-black mt-4">
									<div>Woman BasketBall Player</div>
									<div>BNK NO.6</div>
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
								</div>
							</div>
						</div>
						<div className="flex justify-center space-x-4 mt-4 w-full">
							<div className="flex flex-col items-center w-1/3">
								<button
									className="px-4 py-2 bg-red-300 text-white rounded w-full"
									onClick={() => togglePage("profile")}
								>
									Profile
								</button>
							</div>
							<div className="flex flex-col items-center w-1/3">
								<button
									className="px-4 py-2 bg-red-300 text-white rounded w-full"
									onClick={() => togglePage("stats")}
								>
									Stats
								</button>
							</div>
							<div className="flex flex-col items-center w-1/3">
								<button
									className="px-4 py-2 bg-red-300 text-white rounded w-full"
									onClick={() => togglePage("photos")}
								>
									Photos
								</button>
							</div>
						</div>
						<div className="mt-4 w-full h-[500px]">
							{activePage === "profile" && (
								<div className="p-4 bg-white rounded shadow-md w-full h-full">
									<Profile />
								</div>
							)}
							{activePage === "stats" && (
								<div className="p-4 bg-white rounded shadow-md w-full h-full flex justify-center items-center">
									<Stats />
								</div>
							)}
							{activePage === "photos" && (
								<div className="p-4 bg-white rounded shadow-md w-full h-full flex justify-center items-center">
									<GetPhotos />
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MainPage;
