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
		<main className="bg-white min-h-screen flex flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold">BNK NO 6. 이소희</h1>
			</div>
			<div className="mt-8 h-[580px] w-full lg:w-[1440px] flex items-center justify-center">
				<Opening />
			</div>
			<div className="mt-8">
				<button className="w-[150px] bg-gray-500 hover:bg-red-500 text-white font-bold py-2 px-4 rounded">
					<Link href="/home">Go!</Link>
				</button>
			</div>
		</main>
	);
}
