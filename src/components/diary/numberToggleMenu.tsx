import React, { useState } from "react";

interface Props {
	onSelect: (numbers: string) => void;
}

const NumberToggleMenu: React.FC<Props> = ({ onSelect }) => {
	const [isNumberOpen, setIsNumberOpen] = useState<boolean>(false);

	const NumberMenu = () => {
		setIsNumberOpen(!isNumberOpen);
	};

	const numbers: { [key: string]: string } = {
		"1": "1번",
		"2": "2번",
		"3": "3번",
		"4": "4번",
		"5": "5번",
		"6": "6번",
		"7": "7번",
		"8": "8번",
		"9": "9번",
		"10": "10번",
		"11": "11번",
		"12": "12번",
		"13": "13번",
		"14": "14번",
		"15": "15번",
		"16": "16번",
		"17": "17번",
		"18": "18번",
		"19": "19번",
		"20": "20번",
		"21": "21번",
		"22": "22번",
		"23": "23번",
		"24": "24번",
		"25": "25번",
		"26": "26번",
		"27": "27번",
		"28": "28번",
		"29": "29번",
		"30": "30번",
		"31": "31번",
		"32": "32번",
		"33": "33번",
		"34": "34번",
		"35": "35번",
		"36": "36번",
		"37": "37번",
		"38": "38번",
		"39": "39번",
		"40": "40번",
	};

	return (
		<div className="relative">
			<button
				onClick={NumberMenu}
				className="text-sm px-2 py-1 hover:bg-red-200 focus:outline-none"
			>
				{isNumberOpen ? "▼" : "▶"}
			</button>

			{isNumberOpen && (
				<div className="bg-white absolute right-0 top-full py-2 border rounded shadow-lg w-[80px] max-h-[300px] overflow-y-auto z-10">
					<div className="flex flex-col items-center justify-center">
						{Object.keys(numbers).map((key) => (
							<button
								key={key}
								onClick={() => {
									onSelect(key);
									setIsNumberOpen(false);
								}}
								className="text-sm p-1 hover:bg-gray-200 rounded"
							>
								{numbers[key]}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default NumberToggleMenu;
