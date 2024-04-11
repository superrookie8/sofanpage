import { usePathname } from "next/navigation";
import Link from "next/link";

interface Props {
	pathname: string;
}

const Header: React.FC<Props> = () => {
	const pathname = usePathname();
	const linkStyle = (path: string) => {
		const isActive =
			path === "/sonic" ? pathname === path : pathname.startsWith(path);
		return isActive ? "bg-red-400 rounded px-2 py-1" : "";
	};
	return (
		<>
			<div className="bg-red-500 text-white text-center py-4 text-2xl font-bold h-[100px]">
				BNK NO6.이소희
			</div>
			<header className="bg-red-500 text-white p-4 ">
				<nav className="max-w-[600px] container mx-auto flex justify-between mr-4 ">
					<Link href="/">Intro</Link>
					<Link href="/sonic" className={linkStyle("/sonic")}>
						Profile
					</Link>
					<Link href="/sonic/news" className={linkStyle("/sonic/news")}>
						News
					</Link>
					<Link href="/sonic/events" className={linkStyle("/sonic/events")}>
						Events
					</Link>
					<Link href="/sonic/schedule" className={linkStyle("/sonic/schedule")}>
						Schedule
					</Link>
					<Link
						href="/sonic/guestbooks/read"
						className={linkStyle("/sonic/guestbooks/")}
					>
						Guestbooks
					</Link>
				</nav>
			</header>
		</>
	);
};

export default Header;
