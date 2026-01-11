"use client";
import MyPageComp from "@/components/mypage/myPageComponent";
import useAuth from "@/features/auth/hooks/useAuth";

export default function Mypage() {
	useAuth();

	return (
		<div>
			<div className="flex justify-center items-center ">
				<div className="bg-white bg-opacity-75 min-h-screen w-full flex justify-center p-8 relative">
					<MyPageComp />
				</div>
			</div>
		</div>
	);
}
