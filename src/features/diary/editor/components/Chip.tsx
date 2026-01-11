// src/features/diary/editor/components/Chip.tsx
import React from "react";

interface ChipProps {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({ active, onClick, children }) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-3 py-1.5 rounded-full border text-sm transition ${
				active
					? "bg-gray-900 text-white border-gray-900"
					: "bg-white hover:bg-gray-50 border-gray-300"
			}`}
		>
			{children}
		</button>
	);
};
