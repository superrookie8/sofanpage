interface SelectedLocationProps {
	location: string;
}

const SelectedLocation: React.FC<SelectedLocationProps> = ({ location}) => {
	const where: { [key: string]: string } = {
		busan :"부산 사직실내체육관",
        asan : "아산 이순신체육관",
        yongin : "용인 실내체육관",
        incheon : "인천 도원체육관",
        bucheon: "부천 체육관", 
        chungju: "청주 체육관",
        second: "창원 실내체육관",
        third : "울산 동천체육관",
        other : "기타"

	};

	return (
		<div className="text-xs">
            <span className="text-sm">{where[location]}</span>
			<span>{where[location]? " " : "선택해주세요"}</span>
		</div>
	);
};

export default SelectedLocation;