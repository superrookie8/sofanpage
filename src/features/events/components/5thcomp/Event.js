import React from "react";
import styled from "styled-components";

const TextContainer = styled.div`
  
  border: 3px solid red;
  border-radius: 16px;
  padding: 30px; // 내부 여백
  max-width: 600px; // 최대 너비 설정
  margin: auto; // 자동 마진으로 중앙 정렬
  background-color: white;
  @media (max-width: 768px) {
    margin: 20px; // 화면 너비가 500px 이하일 때 여백
  }
  @media (max-width: 500px) {
    margin: 20px; // 화면 너비가 500px 이하일 때 여백
  }

  @media (max-width: 430px) {
    margin: 15px; // 화면 너비가 430px 이하일 때 여백
  }

  @media (max-width: 360px) {
    margin: 10px; // 화면 너비가 360px 이하일 때 여백
  }
`;

const Title = styled.div`
  font-family: 'GmarketSans', sans-serif;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
`;

const SubTitle = styled.div`
  font-family: 'GmarketSans', sans-serif;
  font-size: 30px;
  font-weight: bold; // 소제목에 더 굵은 폰트 적용
  margin-bottom: 10px;
`;

const TContent = styled.div`
font-family: 'GmarketSans', sans-serif;
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: bold;
`;

const Content = styled.div`
  font-family: 'GmarketSans', sans-serif;
  font-size: 16px;
  margin-bottom: 10px;
`;

const Spacer = styled.div`
  margin-bottom: 30px; // 추가적인 여백을 위한 스페이서
`;

const ImageContainer = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
`;

function Event() {
	const handleButtonClick = () => {
		window.location.href = "https://forms.gle/xWJkvFAq3iLetRuP9"; // 여기에 구글 폼 URL을 넣으세요
	};

	return (
		<TextContainer>
			<Title>BNK SUM 직관/집관 이벤트!!!</Title>

			<TContent>2024년 1월 18일 (vs 신한은행) 홈경기</TContent>
			<TContent>2024년 1월 26일 (vs KB스타즈) 홈경기</TContent>
			<Content> 직관 또는 집관을 인증해주세요!</Content>
			<Content> 선수들 응원도 당연히 가능합니다!!</Content>
			<Content>
				약소하지만 인증 해주신 모든 분들께 스티커와 키링을 선물로 드리려 해요.
			</Content>
			<ImageContainer>
				<StickerImage src="/5th/sticker.png" alt="스티커" />
				<KeyringImage src="/5th/keyring.png" alt="키링" />
			</ImageContainer>
			<Spacer />

			<Spacer />
			<Spacer />
			<SubTitle>**참여방법!</SubTitle>
			<TContent>1. 이소희 선수 사진과 함께 직관 또는 집관 인증하기</TContent>
			<Content style={{ paddingLeft: "20px" }}>
				(예) 당일 직관 티켓을 인증해주시거나, 집에서 중계화면 캡쳐 떠서
				인증해주세요.
			</Content>
			<Content>
				단, 사진 어느부분에는 반드시 &quot;이소희 선수&quot;의 얼굴이 보여야
				합니다. (얼굴 또는 유니폼번호)
			</Content>
			<Content>
				티켓을 찍을때는 이소희 선수 사진 앞에서 찍거나 여러가지 방법이 있겠죠?
				ㅎㅎ
			</Content>
			<Spacer />
			<Spacer />
			<TContent>2. 각자의 SNS에 해시태그를 붙여서 업로드하기</TContent>
			<Content>
				#프로데뷔5주년 #이소희선수 #부산bnk썸 #소희야프로데뷔5주년축하해
			</Content>
			<Content style={{ paddingLeft: "20px" }}>
				(예)인스타 스토리에 1개 이상 해시태그를 달아서 업로드{" "}
			</Content>
			<Content>
				부산 지하철 3호선 종합운동장역에 붙어있는 광고판도 인증을 해주시면
				더더더 좋습니다!
			</Content>
			<Spacer />
			<SubTitle>Quiz!!!</SubTitle>
			<Content>**문제**</Content>
			<TContent>
				영상에 등장한 소희선수의 등번호를 모두 나열해 주세요!!
			</TContent>
			<Content>답은 폼작성 부탁드립니다!ㅋㅋ</Content>
			<Content> 인증 후 폼 작성해주시면 감사하겠습니다..!</Content>
			<Spacer />
			<ButtonContainer>
				<Button onClick={handleButtonClick}>폼작성</Button>
			</ButtonContainer>
			<Spacer />
			<Content>
				**인증도 하고, 퀴즈도 맞히신 분들중 두 분께는 후드티 선물로
				드리겠습니다!(디자인 변동가능..!)
			</Content>
			<ImageContainer>
				<HoodieImage src="/5th/hood.png" alt="후드" />
			</ImageContainer>
			<Spacer />
			<Content>
				결과는 1월 27일 이후, 이 웹사이트 및 인스타 계정에 업로드 해두겠습니다.
			</Content>
		</TextContainer>
	);
}

export default Event;

const StickerImage = styled.img`
  width: 50%; // 기본 크기
  @media (max-width: 500px) {
    width: 50%; // 500px 이하에서는 너비 100%
  }
`;

const KeyringImage = styled(StickerImage)``;
const HoodieImage = styled.img`
  width: 100%; // 웹 환경에서는 크게
  @media (max-width: 500px) {
    width: 80%; // 500px 이하에서는 너비 80%
  }
  @media (max-width: 430px) {
    width: 70%; // 430px 이하에서는 너비 70%
  }
  @media (max-width: 360px) {
    width: 60%; // 360px 이하에서는 너비 60%
  }
`;

const Button = styled.button`
  width: 100px;
  height: 30px;
  background-color: white; // 버튼의 배경색
  color: red; // 텍스트 색상
  border: 2px solid red; // 빨간색 테두리
  border-radius: 8px; // 둥근 모서리
  font-weight: bold; // 글자 굵기
  cursor: pointer; // 마우스 오버시 커서 변경
  transition: all 0.3s ease; // 부드러운 전환 효과

  &:hover {
    background-color: red; // 호버시 배경색 변경
    color: white; // 호버시 텍스트 색상 변경
  }
`;

const ButtonContainer = styled.div`
display: flex;
justify-content: center;
align-items: center;
`;
