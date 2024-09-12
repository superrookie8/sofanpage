interface SelectedNumberProps {
	number: string;
}

const SelectedNumber: React.FC<SelectedNumberProps> = ({ number }) => {
	const numberLabels: { [key: string]: string } = {
		"1": "1번",
		"2": "2번",
		"3": "3번",
		// 다른 번호 추가 가능
	};

	return (
		<div className="text-xs">
			<span className="text-xs">{numberLabels[number] || "선택"}</span>
		</div>
	);
};

export default SelectedNumber;
