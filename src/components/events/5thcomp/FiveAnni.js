import React from "react";
import styled from "styled-components";

function FiveAnni() {
	return (
		<StyledDiv>BNK SUM 이소희 선수의 프로데뷔 5주년을 축하합니다</StyledDiv>
	);
}

export default FiveAnni;

const StyledDiv = styled.div`
font-family:'GmarketSansMedium', sans-serif;
  font-size: 16px; // 기본 폰트 크기

  @media (min-width: 768px) {
    font-size: 24px; // 태블릿 크기 이상에서 적용될 폰트 크기
  }

  @media (min-width: 1024px) {
    font-size: 32px; // 데스크탑 크기 이상에서 적용될 폰트 크기
  }

  @media (min-width: 1200px) {
    font-size: 60px; // 큰 데스크탑 크기 이상에서 적용될 폰트 크기
  }
`;
