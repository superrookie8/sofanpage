// src/features/diary/editor/components/NumberInput.tsx
import React from "react";

interface NumberInputProps {
	value: number | "";
	onChange: (v: number | "") => void;
	placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
	value,
	onChange,
	placeholder = "0",
}) => {
	return (
		<input
			type="text"
			inputMode="numeric"
			value={value}
			placeholder={placeholder}
			onChange={(e) => {
				const raw = e.target.value;
				if (raw.trim() === "") return onChange("");
				const n = Number(raw);
				if (Number.isNaN(n)) return;
				onChange(Math.max(0, Math.floor(n)));
			}}
			className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
		/>
	);
};
