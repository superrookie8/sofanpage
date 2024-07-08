import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
	pathname: string;
}

const Header: React.FC<Props> = () => {
	const router = useRouter();
	const pathname = usePathname();
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		setIsLoggedIn(!!token);
	}, []);

	const linkStyle = (path: string) => {
		const isActive =
			path === "/profile" ? pathname === path : pathname.startsWith(path);
		return isActive ? "bg-red-200 rounded px-2 py-1" : "";
	};

	const handleLogout = () => {
		sessionStorage.removeItem("token"); // 토큰을 세션 스토리지에서 제거
		router.push("/login"); // 로그인 페이지로 리디렉션
	};

	return (
		<>
			<header className="w-full bg-white text-red-500 p-4">
				<nav className="container mx-auto flex justify-between items-center">
					<div className="flex items-center space-x-8 ml-auto">
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
							<Link href="/mypage" className={linkStyle("/mypage")}>
								Mypage
							</Link>
						)}
						{isLoggedIn && (
							<button
								onClick={handleLogout}
								className="px-2 py-1 rounded hover:bg-red-200 active:bg-red-600 focus:outline-none"
							>
								Logout
							</button>
						)}
					</div>
				</nav>
			</header>
		</>
	);
};

export default Header;
