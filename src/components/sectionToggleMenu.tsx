import React, { useState } from "react";
import { sectionData } from "@/data/seatingData";

interface Props {
	onSelect: (sections: string) => void;
	location: string;
}

const SectionToggleMenu: React.FC<Props> = ({ onSelect, location }) => {
	const [isSectionOpen, setIsSectionOpen] = useState<boolean>(false);

	const SectionMenu = () => {
		setIsSectionOpen(!isSectionOpen);
	};

	const sections = sectionData[location] || {};

	return (
		<div className="relative">
			<button
				onClick={SectionMenu}
				className="text-sm px-2 py-1 hover:bg-red-200 focus:outline-none z-20"
			>
				{isSectionOpen ? "▼" : "▶"}
			</button>

			{isSectionOpen && (
				<div className="bg-white absolute mt-6 top-0 right-0 py-2 border rounded shadow-lg w-[120px] max-h-[300px] overflow-y-auto z-10">
					<div className="flex flex-col items-center justify-center">
						{Object.keys(sections).map((key) => (
							<button
								key={key}
								onClick={() => {
									onSelect(key);
									setIsSectionOpen(false);
								}}
								className="text-sm p-1 hover:bg-gray-200 rounded"
							>
								{sections[key]}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default SectionToggleMenu;
