import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
		sessionStorage.removeItem("token"); // 토큰을 세션 스토리지에서 제거
		router.push("/login"); // 로그인 페이지로 리디렉션
	};
	return (
		<>
			<header className="bg-red-500 text-white p-4">
				<nav className="max-w-[1200px] container mx-auto flex items-front justify-end">
					<div className="relative w-[1200px] h-[200px]">
						<Image
							src="/images/supersoheeheader.png"
							alt="Header"
							width={1920}
							height={1080}
							style={{ objectFit: "fill" }}
							className="absolute"
							priority
						/>
					</div>
					<div className="flex items-center space-x-8 absolute pt-8 pr-4">
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
						<button
							onClick={handleLogout}
							className="px-2 py-1 rounded hover:bg-red-400 active:bg-red-600 focus:outline-none"
						>
							Logout
						</button>
					</div>
				</nav>
			</header>
		</>
	);
};

export default Header;
