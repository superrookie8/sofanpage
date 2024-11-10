// components/Header.tsx
"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRecoilState } from "recoil";
import { loginState } from "@/states/loginState"; // Import the login state

const Header: React.FC = () => {
	const pathname = usePathname();
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState); // Use the login state

	// 메뉴 참조를 위한 ref 추가
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		setIsLoggedIn(!!token);
	}, [setIsLoggedIn]);

	// 외부 클릭 감지를 위한 useEffect 추가
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				isMenuOpen &&
				menuRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isMenuOpen]);

	const linkStyle = (path: string) => {
		if (!pathname) return "";

		const isActive =
			path === "/profile" ? pathname === path : pathname.startsWith(path);
		return isActive ? "text-black" : "";
	};

	const mobileLinkStyle = (path: string) => {
		if (!pathname) return "w-full flex justify-center items-center";

		const isActive =
			path === "/profile" ? pathname === path : pathname.startsWith(path);
		return isActive
			? "border-red-500 border-t border-b w-full flex justify-center items-center"
			: "w-full flex justify-center items-center";
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
		// <header className="w-full bg-white text-red-500 p-4 z-50 relative">
		<header className="w-full text-white bg-red-500 sm:bg-white p-4 z-50 relative">
			<div className="w-[100%] static ml-auto ">
				<nav className="container mx-auto flex  items-center justify-end">
					<div className="sm:hidden md:hidden lg:flex lg:items-center space-x-16 lg:space-x-9 xl:space-x-16 ">
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
					<div className="lg:hidden static ml-auto ">
						<div className="flex items-center rounded  bg-white sm:bg-red-500">
							<button
								ref={buttonRef}
								onClick={toggleMenu}
								className="px-2 py-1 text-red-500 sm:text-white rounded hover:bg-black active:bg-red-600 focus:outline-none"
							>
								☰
							</button>
						</div>
					</div>
				</nav>
			</div>
			{isMenuOpen && (
				// <div className="flex text-red-500 ml-[25%] mt-1 rounded bg-white absolute left-0 w-[60%] md:hidden lg:hidden  shadow-lg z-40">
				<div
					ref={menuRef}
					className="absolute w-full text-red-500 right-0 mt-1 rounded bg-white  lg:hidden shadow-lg z-40"
				>
					<div className="w-full p-4 space-y-2">
						<Link
							href="/home"
							className={`${mobileLinkStyle(
								"/home"
							)} hover:bg-red-200 active:bg-red-600`}
							onClick={toggleMenu}
						>
							홈
						</Link>
						<Link
							href="/news"
							className={`${mobileLinkStyle(
								"/news"
							)} hover:bg-red-200 active:bg-red-600`}
							onClick={toggleMenu}
						>
							뉴스
						</Link>
						<Link
							href="/events"
							className={`${mobileLinkStyle(
								"/events"
							)} hover:bg-red-200 active:bg-red-600`}
							onClick={toggleMenu}
						>
							이벤트
						</Link>
						<Link
							href="/arcade"
							className={`${mobileLinkStyle(
								"/arcade"
							)} hover:bg-red-200 active:bg-red-600`}
							onClick={toggleMenu}
						>
							아케이드
						</Link>
						<Link
							href="/schedule"
							className={`${mobileLinkStyle(
								"/schedule"
							)} hover:bg-red-200 active:bg-red-600`}
							onClick={toggleMenu}
						>
							경기스케줄
						</Link>
						<Link
							href="/guestbooks/read"
							className={`${mobileLinkStyle(
								"/guestbooks/"
							)} hover:bg-red-200 active:bg-red-600`}
							onClick={toggleMenu}
						>
							방명록
						</Link>

						{!isLoggedIn && (
							<>
								<Link
									href="/diary/read"
									className={`${mobileLinkStyle(
										"/mypage"
									)} hover:bg-red-200 active:bg-red-600`}
									onClick={toggleMenu}
								>
									직관일지
								</Link>
								<Link
									href="/login"
									className={`${mobileLinkStyle(
										"/login"
									)} hover:bg-red-200 active:bg-red-600`}
									onClick={toggleMenu}
								>
									로그인
								</Link>
								<Link
									href="/signup"
									className={`${mobileLinkStyle(
										"/signup"
									)} hover:bg-red-200 active:bg-red-600`}
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
									className={`${mobileLinkStyle(
										"/mypage"
									)} hover:bg-red-200 active:bg-red-600`}
									onClick={toggleMenu}
								>
									직관일지
								</Link>
								<Link
									href="/mypage"
									className={`${mobileLinkStyle(
										"/mypage"
									)} hover:bg-red-200 active:bg-red-600`}
									onClick={toggleMenu}
								>
									마이페이지
								</Link>
								<button
									onClick={() => {
										handleLogout();
										toggleMenu();
									}}
									className="py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none w-full "
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
