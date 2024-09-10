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
		<div className="text-lg">
  <span className="text-3xl">{weatherIcons[weather]}</span> {/* weatherIcons 부분은 text-2xl */}
  <span>{weatherIcons[weather] ? '' : '선택해주세요'}</span> {/* 선택해주세요는 text-lg */}
</div>

	);
};

export default SelectedWeather;
