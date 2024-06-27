"use client";

import { GoCreateButtons } from "@/components/buttons";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import GuestBookCardList from "@/components/guestbookcard";
import useAuth from "@/hooks/useAuth";

const GuestBookList: React.FC = (props) => {
	useAuth();
	return (
		<div>
			<Header pathname="" />
			<div className="flex justify-center items-center">
				<div className="bg-red-500 min-h-screen w-full flex justify-center p-8 relative ">
					<div className="bg-yellow-500 h-[550px] min-w-[1200px] flex justify-center  relative  ">
						<div className="bg-white h-[450px] w-full flex justify-center items-center absolute  ">
							<GuestBookCardList />
						</div>
						<GoCreateButtons currentCategory="" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default GuestBookList;
