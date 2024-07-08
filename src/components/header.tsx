"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const Header: React.FC = () => {
	const pathname = usePathname();
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		setIsLoggedIn(!!token);
	}, []);

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
		sessionStorage.removeItem("token"); // 토큰을 세션 스토리지에서 제거
		setIsLoggedIn(false); // 로그아웃 시 상태 업데이트
	};

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<>
			<header className="w-full bg-white text-red-500 p-4 z-50 relative">
				<nav className="container mx-auto flex justify-between items-center">
					<div className="hidden md:flex items-center space-x-8 ml-auto">
						<Link href="/home" className={linkStyle("/home")}>
							Home
						</Link>
						<Link href="/news" className={linkStyle("/news")}>
							News
						</Link>
						<Link href="/events" className={linkStyle("/events")}>
							Events
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
								<button
									onClick={handleLogout}
									className="px-2 py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none"
								>
									Logout
								</button>
							</>
						)}
					</div>
					<div className="flex items-center space-x-4 md:hidden ml-auto">
						<button
							onClick={toggleMenu}
							className="px-2 py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none"
						>
							☰
						</button>
					</div>
				</nav>
				{isMenuOpen && (
					<div className="md:hidden bg-white absolute top-full right-4 shadow-lg z-40">
						<div className="flex flex-col items-start p-4 space-y-2 w-40">
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
										className="py-1rounded hover:bg-red-200 active:bg-red-600 focus:outline-none w-full text-left"
									>
										Logout
									</button>
								</>
							)}
						</div>
					</div>
				)}
			</header>
		</>
	);
};

export default Header;
