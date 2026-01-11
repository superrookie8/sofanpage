"use client";
import Profile from "@/features/profile/components/profile";
import Stats from "@/components/home/stats";
import GetPhotos from "@/shared/ui/photos";
import { useState } from "react";

import MainImage from "@/components/opening/mainImage";

const MainPage: React.FC = () => {
	return (
		<div className="bg-transparent min-h-screen flex flex-col items-center relative">
			<div className="w-full flex items-center sm: h-[200px] md:h-[300px]  lg:h-[400px]  max-w-6xl ">
				<MainImage />
			</div>

			<div className="w-full flex justify-center z-10">
				<div className="w-full">
					<div className="bg-red-600 text-white sm: border-b-2  sm: border-t-2 sm:bg-white sm:text-red-500 sm:bg-opacity-75 border-red-500 h-[50px] w-full flex justify-center items-center">
						프로필
					</div>
					<section className="flex justify-center">
						<div className="w-[80%] sm:w-full bg-white bg-opacity-75 pb-4  rounded flex flex-wrap ">
							<Profile />
						</div>
					</section>
				</div>
			</div>

			<div className="w-full flex justify-center z-10">
				<div className="w-full">
					<div className="bg-red-600 text-white sm:bg-white sm:text-red-500  sm:border-b-2 sm:border-t-2 sm:bg-opacity-75 border-red-500 h-[50px] w-full flex justify-center items-center">
						기록
					</div>
					<section className="flex justify-center bg-white bg-opacity-75">
						<div className="w-[80%] sm:w-[100%] xsm:w-[100%] bg-white bg-opacity-75 pb-4 pt-4 rounded overflow-x-auto">
							<Stats />
						</div>
					</section>
				</div>
			</div>

			{/* <div className="w-full flex justify-center z-10">
				<div className="w-full">
					<div className="bg-red-600 text-white sm:bg-white sm:text-red-500  sm:border-b-2 sm:border-t-2 sm:bg-opacity-75 border-red-500 h-[50px] w-full flex justify-center items-center">
						사진
					</div>
					<section className="flex justify-center">
						<div className="w-[80%] sm:w-full bg-white bg-opacity-75 pb-4 pt-4 rounded overflow-x-auto">
							<GetPhotos />
						</div>
					</section>
				</div>
			</div> */}
		</div>
	);
};

export default MainPage;
