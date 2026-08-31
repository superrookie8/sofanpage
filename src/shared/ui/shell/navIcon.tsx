import type { NavIconName } from "@/shared/nav/navItems";

const PATHS: Record<NavIconName, React.ReactNode> = {
	home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
	news: (
		<>
			<path d="M4 5h13a1 1 0 0 1 1 1v13H5a1 1 0 0 1-1-1z" />
			<path d="M18 9h2v9a1 1 0 0 1-1 1h-1" />
			<path d="M8 9h6M8 13h6M8 16h4" />
		</>
	),
	schedule: (
		<>
			<rect x="3" y="5" width="18" height="16" rx="2" />
			<path d="M3 10h18M8 3v4M16 3v4" />
		</>
	),
	events: (
		<>
			<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
			<path d="M13 6v12" strokeDasharray="2 3" />
		</>
	),
	arcade: (
		<>
			<rect x="2" y="7" width="20" height="11" rx="4" />
			<path d="M7 11v3M5.5 12.5h3M15.5 12h.01M18 14h.01" />
		</>
	),
	diary: (
		<>
			<path d="M5 4a1 1 0 0 1 1-1h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
			<path d="M9 3v18M12 8h4M12 12h4" />
		</>
	),
	me: (
		<>
			<circle cx="12" cy="8" r="4" />
			<path d="M4 21a8 8 0 0 1 16 0" />
		</>
	),
	guestbook: (
		<>
			<path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4z" />
			<path d="M8 8h8M8 12h5" />
		</>
	),
};

/** 하단 탭·메뉴용 스트로크 아이콘 (22px, stroke 1.8) */
export default function NavIcon({
	name,
	size = 22,
	className,
}: {
	name: NavIconName;
	size?: number;
	className?: string;
}) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.8}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
			className={className}
		>
			{PATHS[name]}
		</svg>
	);
}
