"use client";
import MyPageComp from "@/components/MyPageComponent";
import useAuth from "@/hooks/useAuth";

export default function Mypage() {
	useAuth();

	return (
		<div>
			<div className="flex justify-center items-center ">
				<div className="bg-red-500 min-h-screen w-full flex justify-center p-8 relative">
					<div className="bg-yellow-500 min-h-[580px] min-w-[1200px] flex p-8">
						<MyPageComp />
					</div>
				</div>
			</div>
		</div>
	);
}
