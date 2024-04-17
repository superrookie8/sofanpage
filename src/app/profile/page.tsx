"use client";

import Sidebar from "@/components/sidebar";
import Carousel from "../../components/carousel";
import images from "../../components/images";
import Header from "@/components/header";

const Sonic: React.FC = () => {
	return (
		<div>
			<Header pathname="" />
			<div className="flex justify-center items-center  ">
				<div className="bg-red-500 min-h-screen  w-full flex justify-center p-8 relative">
					<Sidebar />
					<div className=" w-[1200px]  flex justify-between ">
						<Carousel images={images} />
						<div className=" bg-white w-[550px] h-[500px] flex flex-col justify-center items-center relative">
							<div className="bg-pink-300 w-[400px] h-[400px] flex flex-col absolute ">
								<p className="ml-8 mt-8">Name : 이소희</p>
								<p className="ml-8 mt-4">
									Position : Guard / Shooting Guard / Dual Guard
								</p>
								<p className="ml-8 mt-4">Number : No.6</p>
								<p className="ml-8 mt-4">Height : 170cm</p>
								<p className="ml-8 mt-4">Nickname : SuperSonic / BalBal </p>
								<p className="ml-8 mt-4">
									Features: Ambidextrous. The league&apos;s top technician.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sonic;
