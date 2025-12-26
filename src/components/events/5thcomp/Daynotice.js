import React from "react";
import styled from "styled-components";

// 컨테이너 스타일링
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; // 전체 높이를 차지하도록 설정
  padding: 20px;
  background-image: url('/5th/this.PNG'); // 배경 이미지 설정
  background-size: cover; // 배경 이미지 크기 조정
  background-position: center; // 배경 이미지 위치 조정

  @media (max-width: 768px) {
    // 모바일 뷰를 위한 미디어 쿼리
    flex-direction: column; 
    /* justify-content: flex-start;
    padding-top : 158vh; */
  }
`;

// 텍스트 박스 스타일링
const TextBox = styled.div`
  background-color: #f0f0f0; // 박스 배경색
  padding: 20px;
  border-radius: 10px; // 박스 모서리 둥글게
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // 그림자 효과
  margin-top : 580px;
  // 폰트 스타일링은 원하는 대로 조정
  font-size: 1.5em; 
  text-align: center;
`;

function Daynotice() {
	return (
		<Container>
			<TextBox>2024.01.18. 오픈예정</TextBox>
		</Container>
	);
}

export default Daynotice;
