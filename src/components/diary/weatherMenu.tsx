import React, { useState, useRef, useEffect } from "react";

interface Props {
	onSelect: (weather: string) => void;
}

const WeatherToggleMenu: React.FC<Props> = ({ onSelect }) => {
	const [isWeatherOpen, setIsWeatherOpen] = useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsWeatherOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const weatherMenu = () => {
		setIsWeatherOpen(!isWeatherOpen);
	};

	const weatherIcons: { [key: string]: string } = {
		sunny: "☀️",
		cloudy: "☁️",
		snowy: "❄️",
		rainy: "☂️",
		night: "🌙",
		stormy: "⚡",
	};

	return (
		<div className="relative z-10" ref={menuRef}>
			<button
				onClick={weatherMenu}
				className="px-2 py-1 ml-6 hover:bg-red-200  focus:outline-none"
			>
				{isWeatherOpen ? "▼" : "▶"}
			</button>

			{isWeatherOpen && (
				<div className="bg-white absolute top-full px-4 py-2 border rounded shadow-lg">
					<div className="flex flex-row items-center justify-center w-[200px] h-[20px] p-4">
						{Object.keys(weatherIcons).map((key) => (
							<button
								key={key}
								onClick={() => {
									onSelect(key);
									setIsWeatherOpen(false);
								}}
								className=" text-2xl p-2 hover:bg-gray-200 rounded"
							>
								{weatherIcons[key]}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default WeatherToggleMenu;
