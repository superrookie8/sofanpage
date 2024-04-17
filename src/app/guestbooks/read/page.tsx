"use client";

import { GoCreateButtons } from "@/components/buttons";
import Header from "@/components/header";
import PhotoCard from "@/components/photoCard";
import Sidebar from "@/components/sidebar";
import TextCard from "@/components/textCard";

const GuestBookList: React.FC = (props) => {
	return (
		<div>
			<Header pathname="" />
			<div className="flex justify-center items-center">
				<div className="bg-red-500 min-h-screen w-full flex justify-center p-8 relative ">
					<Sidebar />
					<div className="bg-yellow-500 h-[550px] min-w-[1200px] flex justify-center  relative  ">
						<div className="bg-white h-[450px] w-full flex justify-center items-center absolute  ">
							<div className="flex flex-col justify-center items-center w-[250px] h-[350px] ">
								<PhotoCard />

								{/* <TextCard /> */}
							</div>
						</div>
						<GoCreateButtons currentCategory="" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default GuestBookList;
