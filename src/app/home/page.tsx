"use client";

import Sidebar from "@/components/sidebar";
import Carousel from "@/components/carousel";
import images from "@/components/images";
import Profile from "@/components/profile";
import Photos from "@/components/photos";
import Header from "@/components/header";
import Image from "next/image";
import { useState } from "react";

const MainPage: React.FC = () => {
	const [activePage, setActivePage] = useState<string | null>(null);

	const togglePage = (page: string) => {
		setActivePage((prevActivePage) => (prevActivePage === page ? null : page));
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
						<div className="mt-4 w-full h-[600px]">
							{activePage === "profile" && (
								<div className="p-4 bg-white rounded shadow-md w-full h-full">
									<Profile />
								</div>
							)}
							{activePage === "stats" && (
								<div className="p-4 bg-white rounded shadow-md w-full h-full">
									<div>Stats Component</div>
								</div>
							)}
							{activePage === "photos" && (
								<div className="p-4 bg-white rounded shadow-md w-full h-full">
									<Photos />
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
