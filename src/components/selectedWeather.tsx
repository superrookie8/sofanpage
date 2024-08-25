interface SelectedWeatherProps {
	weather: string;
}

const SelectedWeather: React.FC<SelectedWeatherProps> = ({ weather }) => {
	const weatherIcons: { [key: string]: string } = {
		sunny: "☀️",
		cloudy: "☁️",
		snowy: "❄️",
		rainy: "☂️",
		night: "🌙",
		stormy: "⚡",
	};

	return (
		<div className="text-2xl">
			{weather ? weatherIcons[weather] : "날씨를 선택하세요"}
		</div>
	);
};

export default SelectedWeather;
