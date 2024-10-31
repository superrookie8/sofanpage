interface SelectedRowProps {
	row: string;
}

const SelectedRow: React.FC<SelectedRowProps> = ({ row }) => {
	const rowLabels: { [key: string]: string } = {
		"1": "1열orA",
		"2": "2열orB",
		"3": "3열orC",
		"4": "4열orD",
		"5": "5열orE",
		"6": "6열orF",
		"7": "7열orG",
		"8": "8열orH",
		"9": "9열orI",
		"10": "10열orJ",
		"11": "11열orK",
		"12": "12열orL",
		"13": "13열orM",
		"14": "14열orN",
		"15": "15열orO",
		"16": "16열orP",
		"17": "17열orQ",
		"18": "18열orR",
		"19": "19열orS",
		"20": "20열orT",
		"21": "21열orU",
		"22": "22열orV",
		"23": "23열orW",
		"24": "24열orX",
	};

	return (
		<div className="text-xs">
			<span className="text-xs">{rowLabels[row] || "선택"}</span>
		</div>
	);
};

export default SelectedRow;
