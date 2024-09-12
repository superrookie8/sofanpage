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
		// 다른 번호들
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
