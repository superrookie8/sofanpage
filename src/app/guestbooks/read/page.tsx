"use client";

import { GoCreateButtons } from "@/components/buttons";
import Header from "@/components/header";
import Sidebar from "@/components/Sidebar";
import GuestBookCardList from "@/components/guestbookcard";
import useAuth from "@/hooks/useAuth";

const GuestBookList: React.FC = (props) => {
	useAuth();
	return (
		<div>
			<Header pathname="" />
			<div className=" flex justify-center items-center bg-red-500">
				<div className="bg-blue-500 h-[460px] w-auto flex justify-center relative ">
					<div className="bg-yellow-500 h-[400px] min-w-[1200px] flex justify-center  relative  ">
						<div className="bg-white h-[380px] w-full flex justify-center items-center absolute  ">
							<GuestBookCardList />
						</div>
					</div>
					<GoCreateButtons currentCategory="" />
				</div>
			</div>
		</div>
	);
};

export default GuestBookList;
