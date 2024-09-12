import React, { useState } from "react";

interface Props {
	onSelect: (rows: string) => void;
}

const RowToggleMenu: React.FC<Props> = ({ onSelect }) => {
	const [isRowOpen, setIsRowOpen] = useState<boolean>(false);

	const RowMenu = () => {
		setIsRowOpen(!isRowOpen);
	};

	const rows: { [key: string]: string } = {
		"1": "1열",
		"2": "2열",
		"3": "3열",
		// 다른 열들
	};

	return (
		<div className="relative">
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
