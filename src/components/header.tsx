import { usePathname } from "next/navigation";
import Link from "next/link";

interface Props {
	pathname: string;
}

const Header: React.FC<Props> = () => {
	const pathname = usePathname();
	const linkStyle = (path: string) => {
		const isActive =
			path === "/profile" ? pathname === path : pathname.startsWith(path);
		return isActive ? "bg-red-400 rounded px-2 py-1" : "";
	};
	return (
		<>
			<div className="bg-red-500 text-white text-center flex justify-center items-center py-4 text-6xl font-bold h-[100px]">
				BNK NO6.이소희
			</div>

			<header className="bg-red-500 text-white p-4 ">
				<nav className="max-w-[600px] container mx-auto flex justify-between mr-4 ">
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
				</nav>
			</header>
		</>
	);
};

export default Header;
