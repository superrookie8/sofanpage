interface SelectedWinLoseProps {
	winningmode: string;
}

const SelectedWinningMode: React.FC<SelectedWinLoseProps> = ({ winningmode}) => {
	const selectWinLose: { [key: string]: string } = {
		win : "승요",
        lose : "패요"

	};

	return (
		<div className="text-xs">
            <span className="text-sm">{selectWinLose[winningmode]}</span>
			<span>{selectWinLose[winningmode]? " " : "선택해주세요"}</span>
		</div>
	);
};

export default SelectedWinningMode;