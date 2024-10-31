import React, { useState, useRef, useEffect } from "react";

interface Props {
	onSelect: (winningmode: string) => void;
}

const WinningToggleMenu: React.FC<Props> = ({ onSelect }) => {
	const [isWinningOpen, setIsWinningOpen] = useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsWinningOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const WinningMenu = () => {
		setIsWinningOpen(!isWinningOpen);
	};

	const winningmode: { [key: string]: string } = {
		win: "승요",
		lose: "패요",
	};

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={WinningMenu}
				className="px-2 py-1 hover:bg-red-200  focus:outline-none"
			>
				{isWinningOpen ? "▼" : "▶"}
			</button>

			{isWinningOpen && (
				<div className="bg-white absolute top-full  py-2 border rounded shadow-lg">
					<div className="flex flex-col items-center justify-center w-[100px] h-[60px] p-4">
						{Object.keys(winningmode).map((key) => (
							<button
								key={key}
								onClick={() => {
									onSelect(key);
									setIsWinningOpen(false);
								}}
								className="text-sm p-1 hover:bg-gray-200 rounded"
							>
								{winningmode[key]}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default WinningToggleMenu;
