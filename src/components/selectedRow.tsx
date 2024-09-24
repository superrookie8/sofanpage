interface SelectedRowProps {
	row: string;
}

const SelectedRow: React.FC<SelectedRowProps> = ({ row }) => {
	const rowLabels: { [key: string]: string } = {
		"1": "1열",
		"2": "2열",
		"3": "3열",
		"4": "4열",
		"5": "5열",
		"6": "6열",
		"7": "7열",
		"8": "8열",
		"9": "9열",
		"10": "10열",
		// 다른 열 추가 가능
	};

	return (
		<div className="text-xs">
			<span className="text-xs">{rowLabels[row] || "선택"}</span>
		</div>
	);
};

export default SelectedRow;
