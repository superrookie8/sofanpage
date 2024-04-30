import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
	pathname: string;
}

const Header: React.FC<Props> = () => {
	const router = useRouter();
	const pathname = usePathname();
	const linkStyle = (path: string) => {
		const isActive =
			path === "/profile" ? pathname === path : pathname.startsWith(path);
		return isActive ? "bg-red-400 rounded px-2 py-1" : "";
	};

	const handleLogout = () => {
		localStorage.removeItem("token"); // 토큰을 로컬 스토리지에서 제거
		router.push("/login"); // 로그인 페이지로 리디렉션
	};
	return (
		<>
			<div className="bg-red-500 text-white text-center flex justify-center items-center py-4 text-6xl font-bold h-[100px]">
				BNK NO6.이소희
			</div>

			<header className="bg-red-500 text-white p-4 ">
				<nav className="max-w-[600px] container mx-auto flex items-center justify-between mr-4 ">
					{/* <Link href="/">Intro</Link> */}
					<Link href="/profile" className={linkStyle("/profile")}>
						Profile
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
					<button
						onClick={handleLogout}
						className="px-2 py-1 rounded hover:bg-red-400 active:bg-red-600 focus:outline-none"
					>
						Logout
					</button>
				</nav>
			</header>
		</>
	);
};

export default Header;
