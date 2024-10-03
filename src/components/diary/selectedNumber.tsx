interface SelectedNumberProps {
	number: string;
}

const SelectedNumber: React.FC<SelectedNumberProps> = ({ number }) => {
	const numberLabels: { [key: string]: string } = {
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
		// 다른 번호 추가 가능
	};

	return (
		<div className="text-xs">
			<span className="text-xs">{numberLabels[number] || "선택"}</span>
		</div>
	);
};

export default SelectedNumber;
