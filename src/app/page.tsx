"use client";
import Opening from "../components/opening";
import Link from "next/link";

export default function Page() {
	return (
		<main className="min-h-screen flex justify-center items-center">
			<div className="flex flex-col items-center justify-center min-h-screen">
				BNK NO 6. 이소희
				{/* 전체 화면을 가운데 정렬하는 컨테이너 */}
				<div className="mt-8 h-[580px] w-[1440px]">
					<Opening />
				</div>
				<div className="mt-8">
					{/* 버튼을 포함할 컨테이너 */}
					<button className="w-[150px] bg-red-500 text-white font-bold py-2 px-4 rounded">
						<Link href="/profile">Go!</Link>
					</button>
				</div>
			</div>
		</main>
	);
}
