"use client";
import Profile from "@/components/profile";
import Stats from "@/components/stats";
import GetPhotos from "@/components/photos";
import { useState } from "react";

import MainImage from "@/components/mainImage";

const MainPage: React.FC = () => {
	return (
		<div className="bg-transparent min-h-screen flex flex-col items-center relative">
			<div className="w-full flex items-center sm: h-[200px] md:h-[300px]  lg:h-[400px]  max-w-6xl ">
				<MainImage />
			</div>

			<div className="w-full flex justify-center z-10">
				<div className="w-full max-w-6xl">
					<div className="bg-white text-red-500 border-b-2 border-t-2 border-red-500 h-[50px] w-full flex justify-center items-center">
						프로필
					</div>
					<section className="w-full bg-white bg-opacity-75 pb-4 mb-4 rounded">
						<div className="flex flex-wrap ">
							<Profile />
						</div>
					</section>
				</div>
			</div>

			<div className="w-full flex justify-center z-10">
				<div className="w-full max-w-6xl">
					<div className="bg-white text-red-500 bg-opacity-75 border-b-2 border-t-2 border-red-500 h-[50px] w-full flex justify-center items-center">
						기록
					</div>
					<section className="w-full bg-white bg-opacity-75 p-4 mb-4 rounded overflow-x-auto">
						<Stats />
					</section>
				</div>
			</div>

			<div className="w-full flex justify-center z-10">
				<div className="w-full max-w-6xl">
					<div className="bg-white bg-opacity-75 text-red-500 border-b-2 border-t-2 border-red-500 h-[50px] w-full flex justify-center items-center">
						사진
					</div>
					<section className="w-full bg-white bg-opacity-75 p-4 mb-4 rounded overflow-x-auto">
						<div className="flex flex-wrap justify-center">
							<GetPhotos />
						</div>
					</section>
				</div>
			</div>
		</div>
	);
};

export default MainPage;
