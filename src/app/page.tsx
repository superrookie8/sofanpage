"use client";
import Opening from "@/components/opening";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Page() {
	const pathname = usePathname();

	useEffect(() => {
		if (typeof document !== "undefined" && pathname === "/") {
			document.body.classList.add("hide-header");
			return () => {
				document.body.classList.remove("hide-header");
			};
		}
	}, [pathname]);

	// const [isLoggedIn, setIsLoggedIn] = useState(false);

	// useEffect(() => {
	//  const token = sessionStorage.getItem("token");
	//  if (token) {
	//      setIsLoggedIn(true);
	//  } else {
	//      setIsLoggedIn(false);
	//  }
	// }, []);

	return (
		<main className="bg-white min-h-screen flex justify-center items-center">
			<div className="flex flex-col items-center justify-center min-h-screen">
				BNK NO 36. 이소희
				{/* 전체 화면을 가운데 정렬하는 컨테이너 */}
				<div className="mt-8 h-[580px] w-[1440px]">
					<Opening />
				</div>
				<div className="mt-8">
					{/* 버튼을 포함할 컨테이너 */}
					<button className="w-[150px] bg-red-500 text-white font-bold py-2 px-4 rounded">
						<Link href={"/home"}>Go!</Link>
					</button>
				</div>
			</div>
		</main>
	);
}
