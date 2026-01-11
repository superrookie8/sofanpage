import React from "react";
import styled from "styled-components";
import FiveAnni from "./FiveAnni";
import Event from "./Event";
import MatchSchedule from "./MatchSchedule";
import { useState } from "react";

function Layout() {
	const [showContainer, setShowContainer] = useState(false);
	const toggleContainer = () => {
		setShowContainer(!showContainer);
	};

	return (
		<AllLayout>
			<TitleContainer>
				<BackgroundContainer></BackgroundContainer>
			</TitleContainer>

			<FilmContainer>
				<iframe
					width="720px"
					height="480px"
					src="https://www.youtube.com/embed/7SxaKyX5jAQ?si=GKONWadWNUjpEmF_"
					title="YouTube video player"
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen
				></iframe>
			</FilmContainer>

			<NoticeContainer>
				<EventAnounce>
					이벤트에 참여해주신 분들 감사합니다.🙇🏻‍♀️ <br /> 개별연락 드리겠습니다!📫
				</EventAnounce>
				<EventButton onClick={toggleContainer}>이벤트 내용 (클릭)</EventButton>
				{showContainer && (
					<EventContainer isVisible={showContainer}>
						<Event />
					</EventContainer>
				)}

				<MatchScheduleContainer>
					<MatchSchedule />
				</MatchScheduleContainer>
				{/* <ReservationContainer></ReservationContainer> */}
			</NoticeContainer>
		</AllLayout>
	);
}

export default Layout;

const AllLayout = styled.div`
  width: 100%;
  min-height: 100vh; // 변경: 최소 높이를 100vh로 설정
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* background-color: red; */
`;

const ContentContainer = styled.div`
  width: 60%;
  max-width: 720px;
  margin: auto;
  background-color: white;

  @media (max-width: 768px) {
    width: 80%;
  }

  @media (max-width: 620px) {
    width: 75%;
  }

  @media (max-width: 500px) {
    width: 90%;
  }

  @media (max-width: 430px) {
    width: 95%;
  }
`;

const TitleContainer = styled.div`
width : 100%;
height : 300px; 
/* background-color : red; */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;


  @media (max-width: 500px) {
    height: 125px; // 모바일 환경에서 높이를 줄임
  }

  @media (max-width: 430px) {
    height: 108px; // 모바일 환경에서 높이를 줄임
  }
  @media (max-width: 360px) {
    height: 90px; // 모바일 환경에서 높이를 줄임
  }

`;

const FilmContainer = styled.div`
width : 100%;
height :500px;

/* background-color : green; */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
background-image: url('/5th/filmbackground2.png'); // 배경 이미지 설정
  background-repeat: repeat; // 이미지 반복
  background-size: contain; // 이미지 확대 없이 원본 크기 유지

iframe {
    width: 720px; // 기본 너비
    height: 480px; // 기본 높이

    @media (max-width: 720px) {
      width: 620px; // 모바일 화면에서는 너비를 100%로 조절
      height: 413px; // 높이는 비율에 맞게 자동 조절
    }

    @media (max-width: 620px) {
      width: 520px; // 모바일 화면에서는 너비를 100%로 조절
      height: 346px; // 높이는 비율에 맞게 자동 조절
    }

    @media (max-width: 500px) {
      width: 480px; // 모바일 화면에서는 너비를 100%로 조절
      height: 320px; // 높이는 비율에 맞게 자동 조절
    }
    @media (max-width: 430px) {
      width: 420px; // 모바일 화면에서는 너비를 100%로 조절
      height: 280px; // 높이는 비율에 맞게 자동 조절
    }
  }
`;

const NoticeContainer = styled.div`
width : 100%;
height : ${({ isVisible }) => (isVisible ? "4000px" : "auto")};
/* background-color: yellow; */
display: flex;
flex-direction: column;
justify-content: space-between;
align-items: center;
background-image: url('/5th/filmbackground2.png'); // 배경 이미지 설정
  background-repeat: repeat; // 이미지 반복
  background-size: 360px 480px;

@media (max-width: 1024px) {
    height: ${({ isVisible }) =>
			isVisible ? "4000px" : "auto"};// 더 큰 화면에서의 높이 증가
  
  }
@media (max-width: 768px) {
    height:${({ isVisible }) =>
			isVisible ? "4000px" : "auto"};// 더 큰 화면에서의 높이 증가
  }

  @media (max-width: 500px) {
    height:${({ isVisible }) =>
			isVisible ? "3500px" : "auto"}; // 500px 이하에서 높이 증가
  }

  @media (max-width: 430px) {
    height: ${({ isVisible }) =>
			isVisible ? "3200px" : "auto"}; // 430px 이하에서 높이 증가
  }

  @media (max-width: 360px) {
    height:${({ isVisible }) =>
			isVisible ? "2500px" : "auto"}; // 360px 이하에서 높이 증가
  }
`;

const EventButton = styled.div`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
width : 300px;
height : 50px;
font-family:'GmarketSans', sans-serif;
font-size: 24px;
font-weight: bold;
border : 4px red solid;
border-radius : 5%;
margin-top: 20px;
margin-bottom:20px;

cursor: pointer;

  &:hover {
    background-color: red;
    color: white;
  }
`;

const BackgroundContainer = styled.div`
  width: 100%; 
  height: 300px; 
  background-image: url('/5th/font.png'), url('/5th/red.png'); // 두 배경 이미지 결합
  background-size: contain, cover; // 각 배경 이미지에 대한 크기 설정
  background-position: center; // 배경 이미지 중앙 정렬
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 500px) {
    // 모바일 환경에서의 스타일 변경
    background-size: contain, contain; // 모바일에서는 두 배경 모두 contain으로 설정
    background-position: top center;
    background-repeat: no-repeat;
  }
`;

const EventAnounce = styled.div`
width : 100%;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
background-color: white;
border: 4px white solid;
border-radius: 5%;
font-size: larger;
text-align: center; /* 텍스트를 가운데 정렬합니다 */

`;

const EventContainer = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
width : 100%;
height : ${({ isVisible }) => (isVisible ? "50%" : "0")};
overflow: hidden;

`;

const MatchScheduleContainer = styled.div`
width : 100%;
height: 50%;
/* background-color: blue; */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
`;

// const ReservationContainer = styled.div`
// width : 100%;
// height: 20%;
// background-color: gray;
// `;
