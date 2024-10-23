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
				<div className="sm:hidden md:hidden lg:flex items-center space-x-8 ml-auto ">
					<Link href="/home" className={linkStyle("/home")}>
						홈
					</Link>
					<Link href="/news" className={linkStyle("/news")}>
						뉴스
					</Link>
					<Link href="/events" className={linkStyle("/events")}>
						이벤트
					</Link>
					<Link href="/arcade" className={linkStyle("/arcade")}>
						아케이드
					</Link>
					<Link href="/schedule" className={linkStyle("/schedule")}>
						경기스케줄
					</Link>
					<Link href="/guestbooks/read" className={linkStyle("/guestbooks/")}>
						방명록
					</Link>

					{!isLoggedIn && (
						<>
							<Link href="/diary/read" className={linkStyle("/diary")}>
								직관일지
							</Link>
							<Link href="/login" className={linkStyle("/login")}>
								로그인
							</Link>
							<Link href="/signup" className={linkStyle("/signup")}>
								회원가입
							</Link>
						</>
					)}
					{isLoggedIn && (
						<>
							<Link href="/diary/create" className={linkStyle("/diary")}>
								직관일지
							</Link>
							<Link href="/mypage" className={linkStyle("/mypage")}>
								마이페이지
							</Link>

							<button
								onClick={handleLogout}
								className="px-2 py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none"
							>
								로그아웃
							</button>
						</>
					)}
				</div>
				<div className="flex items-center space-x-4  lg:hidden ml-auto bg-gray-200">
					<button
						onClick={toggleMenu}
						className="px-2 py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none"
					>
						☰
					</button>
				</div>
			</nav>
			{isMenuOpen && (
				<div className=" bg-white absolute top-full left-0 w-full shadow-lg z-40">
					<div className="flex flex-col items-start p-4 space-y-2">
						<Link
							href="/home"
							className={mobileLinkStyle("/home")}
							onClick={toggleMenu}
						>
							홈
						</Link>
						<Link
							href="/news"
							className={mobileLinkStyle("/news")}
							onClick={toggleMenu}
						>
							뉴스
						</Link>
						<Link
							href="/events"
							className={mobileLinkStyle("/events")}
							onClick={toggleMenu}
						>
							이벤트
						</Link>
						<Link
							href="/arcade"
							className={mobileLinkStyle("/arcade")}
							onClick={toggleMenu}
						>
							아케이드
						</Link>
						<Link
							href="/schedule"
							className={mobileLinkStyle("/schedule")}
							onClick={toggleMenu}
						>
							경기스케줄
						</Link>
						<Link
							href="/guestbooks/read"
							className={mobileLinkStyle("/guestbooks/")}
							onClick={toggleMenu}
						>
							방명록
						</Link>

						{!isLoggedIn && (
							<>
								<Link
									href="/diary/read"
									className={mobileLinkStyle("/mypage")}
									onClick={toggleMenu}
								>
									직관일지
								</Link>
								<Link
									href="/login"
									className={mobileLinkStyle("/login")}
									onClick={toggleMenu}
								>
									로그인
								</Link>
								<Link
									href="/signup"
									className={mobileLinkStyle("/signup")}
									onClick={toggleMenu}
								>
									회원가입
								</Link>
							</>
						)}
						{isLoggedIn && (
							<>
								<Link
									href="/diary/create"
									className={mobileLinkStyle("/mypage")}
									onClick={toggleMenu}
								>
									직관일지
								</Link>
								<Link
									href="/mypage"
									className={mobileLinkStyle("/mypage")}
									onClick={toggleMenu}
								>
									마이페이지
								</Link>
								<button
									onClick={() => {
										handleLogout();
										toggleMenu();
									}}
									className="py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none w-full text-left"
								>
									로그아웃
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
