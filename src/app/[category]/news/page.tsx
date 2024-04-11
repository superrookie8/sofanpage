"use client";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function News() {
	// const resp = await fetch(`localhost:3000/${props.params.news}`, {
	// 	cache: "no-store",
	// });

	return (
		<div>
			<Header pathname="" />
			<div className="flex justify-center items-center ">
				<div className="bg-red-500 min-h-screen w-full flex justify-center p-8 relative">
					<Sidebar />
					<div className="bg-yellow-500 min-h-[580px] min-w-[1200px] flex p-8">
						내용이 없어서?
					</div>
				</div>
			</div>
		</div>
	);
}
