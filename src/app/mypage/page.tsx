"use client";
import MyPageComp from "@/components/myPageComponent";
import useAuth from "@/hooks/useAuth";

export default function Mypage() {
	useAuth();

	return (
		<div>
			<div className="flex justify-center items-center ">
				<div className="bg-red-500 min-h-screen w-full flex justify-center p-8 relative">
					<MyPageComp />
				</div>
			</div>
		</div>
	);
}
