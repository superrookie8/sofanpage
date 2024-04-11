import { useRouter, usePathname } from "next/navigation";

import useGoPage from "@/hooks/useGoPage";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { pageState } from "@/states/pageState";
import Link from "next/link";

interface Props {
	pathname: string;
}

const Header: React.FC<Props> = () => {
	const pathname = usePathname();
	const linkStyle = (path: string) => {
		const isActive =
			path === "/sonic" ? pathname === path : pathname.startsWith(path);
		return isActive ? "bg-gray-400 rounded px-2 py-1" : "";
	};
	return (
		<header className="bg-gray-500 text-white p-4 mt-32">
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
	);
};

export default Header;
