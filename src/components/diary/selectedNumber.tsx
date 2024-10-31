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
		"11": "11번",
		"12": "12번",
		"13": "13번",
		"14": "14번",
		"15": "15번",
		"16": "16번",
		"17": "17번",
		"18": "18번",
		"19": "19번",
		"20": "20번",
		"21": "21번",
		"22": "22번",
		"23": "23번",
		"24": "24번",
		"25": "25번",
		"26": "26번",
		"27": "27번",
		"28": "28번",
		"29": "29번",
		"30": "30번",
		"31": "31번",
		"32": "32번",
		"33": "33번",
		"34": "34번",
		"35": "35번",
		"36": "36번",
		"37": "37번",
		"38": "38번",
		"39": "39번",
		"40": "40번",
	};

	return (
		<div className="text-xs">
			<span className="text-xs">{numberLabels[number] || "선택"}</span>
		</div>
	);
};

export default SelectedNumber;
