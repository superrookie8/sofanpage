import React, { useState, useRef, useEffect } from "react";

interface Props {
	onSelect: (rows: string) => void;
}

const RowToggleMenu: React.FC<Props> = ({ onSelect }) => {
	const [isRowOpen, setIsRowOpen] = useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsRowOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const RowMenu = () => {
		setIsRowOpen(!isRowOpen);
	};

	const rows: { [key: string]: string } = {
		"1": "1열orA",
		"2": "2열orB",
		"3": "3열orC",
		"4": "4열orD",
		"5": "5열orE",
		"6": "6열orF",
		"7": "7열orG",
		"8": "8열orH",
		"9": "9열orI",
		"10": "10열orJ",
		"11": "11열orK",
		"12": "12열orL",
		"13": "13열orM",
		"14": "14열orN",
		"15": "15열orO",
		"16": "16열orP",
		"17": "17열orQ",
		"18": "18열orR",
		"19": "19열orS",
		"20": "20열orT",
		"21": "21열orU",
		"22": "22열orV",
		"23": "23열orW",
		"24": "24열orX",
	};

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={RowMenu}
				className="text-sm px-2 py-1 hover:bg-red-200 focus:outline-none"
			>
				{isRowOpen ? "▼" : "▶"}
			</button>

			{isRowOpen && (
				<div className="bg-white absolute right-0 top-full py-2 border rounded shadow-lg w-[80px] max-h-[300px] overflow-y-auto z-10">
					<div className="flex flex-col items-center justify-center">
						{Object.keys(rows).map((key) => (
							<button
								key={key}
								onClick={() => {
									onSelect(key);
									setIsRowOpen(false);
								}}
								className="text-sm p-1 hover:bg-gray-200 rounded"
							>
								{rows[key]}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default RowToggleMenu;
