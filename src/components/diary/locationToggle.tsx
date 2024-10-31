import React, { useState, useRef, useEffect } from "react";

interface Props {
	onSelect: (location: string) => void;
}

const LocationToggleMenu: React.FC<Props> = ({ onSelect }) => {
	const [isWhereOpen, setIsWhereOpen] = useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsWhereOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const LocationMenu = () => {
		setIsWhereOpen(!isWhereOpen);
	};

	const where: { [key: string]: string } = {
		busan: "부산 사직실내체육관",
		asan: "아산 이순신체육관",
		yongin: "용인 실내체육관",
		incheon: "인천 도원체육관",
		bucheon: "부천 체육관",
		chungju: "청주 체육관",
		second: "창원 실내체육관",
		third: "울산 동천체육관",
		other: "기타",
	};

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={LocationMenu}
				className="px-2 py-1 hover:bg-red-200  focus:outline-none"
			>
				{isWhereOpen ? "▼" : "▶"}
			</button>

			{isWhereOpen && (
				<div className="bg-white absolute top-full  py-2 border rounded shadow-lg">
					<div className="flex flex-col items-center justify-center w-[200px] h-[250px] p-4">
						{Object.keys(where).map((key) => (
							<button
								key={key}
								onClick={() => {
									onSelect(key);
									setIsWhereOpen(false);
								}}
								className="text-sm p-1 hover:bg-gray-200 rounded"
							>
								{where[key]}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default LocationToggleMenu;
