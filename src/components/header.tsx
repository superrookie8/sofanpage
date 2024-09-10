// components/Header.tsx
"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { loginState } from "@/states/loginState"; // Import the login state

const Header: React.FC = () => {
	const pathname = usePathname();
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState); // Use the login state

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		setIsLoggedIn(!!token);
	}, [setIsLoggedIn]);

	const linkStyle = (path: string) => {
		const isActive =
			path === "/profile" ? pathname === path : pathname.startsWith(path);
		return isActive ? "bg-red-200 rounded px-2 py-1" : "";
	};

	const mobileLinkStyle = (path: string) => {
		const isActive =
			path === "/profile" ? pathname === path : pathname.startsWith(path);
		return isActive ? "border-red-500 border-t border-b w-full" : "w-full";
	};

	const handleLogout = () => {
		sessionStorage.removeItem("token");
		setIsLoggedIn(false);
		router.push("/home");
	};

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<header className="w-full bg-white text-red-500 p-4 z-50 relative">
			<nav className="container mx-auto flex justify-between items-center">
				<div className="sm:hidden md:flex lg:flex items-center space-x-8 ml-auto">
					<Link href="/home" className={linkStyle("/home")}>
						Home
					</Link>
					<Link href="/news" className={linkStyle("/news")}>
						News
					</Link>
					<Link href="/events" className={linkStyle("/events")}>
						Events
					</Link>
					<Link href="/arcade" className={linkStyle("/arcade")}>
						Arcade
					</Link>
					<Link href="/schedule" className={linkStyle("/schedule")}>
						Schedule
					</Link>
					<Link href="/guestbooks/read" className={linkStyle("/guestbooks/")}>
						Guestbooks
					</Link>
					{isLoggedIn && (
						<>
							<Link href="/mypage" className={linkStyle("/mypage")}>
								Mypage
							</Link>
							<Link href="/diary" className={linkStyle("/diary")}>
								Diary
							</Link>
							<button
								onClick={handleLogout}
								className="px-2 py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none"
							>
								Logout
							</button>
						</>
					)}
				</div>
				<div className="flex items-center space-x-4 md:hidden lg:hidden ml-auto">
					<button
						onClick={toggleMenu}
						className="px-2 py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none"
					>
						☰
					</button>
				</div>
			</nav>
			{isMenuOpen && (
				<div className="md:hidden bg-white absolute top-full left-0 w-full shadow-lg z-40">
					<div className="flex flex-col items-start p-4 space-y-2">
						<Link
							href="/home"
							className={mobileLinkStyle("/home")}
							onClick={toggleMenu}
						>
							Home
						</Link>
						<Link
							href="/news"
							className={mobileLinkStyle("/news")}
							onClick={toggleMenu}
						>
							News
						</Link>
						<Link
							href="/events"
							className={mobileLinkStyle("/events")}
							onClick={toggleMenu}
						>
							Events
						</Link>
						<Link
							href="/schedule"
							className={mobileLinkStyle("/schedule")}
							onClick={toggleMenu}
						>
							Schedule
						</Link>
						<Link
							href="/guestbooks/read"
							className={mobileLinkStyle("/guestbooks/")}
							onClick={toggleMenu}
						>
							Guestbooks
						</Link>
						{isLoggedIn && (
							<>
								<Link
									href="/mypage"
									className={mobileLinkStyle("/mypage")}
									onClick={toggleMenu}
								>
									Mypage
								</Link>
								<button
									onClick={() => {
										handleLogout();
										toggleMenu();
									}}
									className="py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none w-full text-left"
								>
									Logout
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	);
};

export default Header;
