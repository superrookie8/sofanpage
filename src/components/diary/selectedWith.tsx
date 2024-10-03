interface SelectedWithProps {
	together: string;
}

const SelectedTogether: React.FC<SelectedWithProps> = ({ together }) => {
	const togetherWatching: { [key: string]: string } = {
		alone :"나와 함께",
        family : "가족",
        friend : "친구",
        friends : "친구들",
        co_worker: "동료", 
        couples: "연인",

	};

	return (
		<div className="text-xs">
			<span className="text-sm">{togetherWatching[together] }</span>
			<span>{togetherWatching[together] ? "": "선택해주세요"}</span>
		</div>
	);
};

export default SelectedTogether;
