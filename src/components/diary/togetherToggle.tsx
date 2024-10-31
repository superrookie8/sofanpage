import React, { useState, useRef, useEffect } from "react";

interface Props {
	onSelect: (together: string) => void;
}

const TogetherToggleMenu: React.FC<Props> = ({ onSelect }) => {
	const [isTogetherWatchingOpen, setIsTogetherWatchingOpen] =
		useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsTogetherWatchingOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const TogetherMenu = () => {
		setIsTogetherWatchingOpen(!isTogetherWatchingOpen);
	};

	const togetherWatching: { [key: string]: string } = {
		alone: "나와 함께",
		family: "가족",
		friend: "친구",
		friends: "친구들",
		co_worker: "동료",
		couples: "연인",
	};

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={TogetherMenu}
				className="px-2 py-1 hover:bg-red-200  focus:outline-none"
			>
				{isTogetherWatchingOpen ? "▼" : "▶"}
			</button>

			{isTogetherWatchingOpen && (
				<div className="bg-white absolute top-full  py-2 border rounded shadow-lg">
					<div className="flex flex-col items-center justify-center w-[110px] h-[160px] p-4">
						{Object.keys(togetherWatching).map((key) => (
							<button
								key={key}
								onClick={() => {
									onSelect(key);
									setIsTogetherWatchingOpen(false);
								}}
								className="text-sm p-1 hover:bg-gray-200 rounded"
							>
								{togetherWatching[key]}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default TogetherToggleMenu;
