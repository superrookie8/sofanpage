"use client";
import { useState } from "react";
import styled from "styled-components";
import Header from "@/components/events/6thcomp/Header";
import Image from "next/image";
import Youtube from "@/components/events/6thcomp/Youtube";
import YoutubeTwo from "@/components/events/6thcomp/YoutubeTwo";
import YoutubeTitle from "@/components/events/6thcomp/YoutubeTitle";
import YoutubeZero from "@/components/events/6thcomp/YoutubeZero";
import Event from "@/components/events/6thcomp/Event";
import LinkPage from "@/components/events/6thcomp/Link";

export default function Home() {
	const [isOldVideoOpen, setIsOldVideoOpen] = useState(false);

	return (
		// <BackgroundContainer>
		<WholeContainer>
			<ViewContainer>
				<PageContainer>
					<TextContainer>
						<Title>농구선수 이소희 프로데뷔 6주년</Title>
						<Description>부산 BNK SUM 여자프로농구단 No.6</Description>
					</TextContainer>

					<Overlay />
					<Image
						src="/6th/sohee2.webp"
						alt="이소희 선수 이미지"
						fill
						style={{
							objectFit: "contain",
							objectPosition: "center",
						}}
						priority
					/>
				</PageContainer>
				<YoutubeContainer>
					<YoutubeTitle />
					<YoutubeBox>
						<YoutubeTwo />
						<Youtube />
					</YoutubeBox>
					<ToggleButton onClick={() => setIsOldVideoOpen(!isOldVideoOpen)}>
						둥글님의 작년 축하 영상 (5주년) {isOldVideoOpen ? "▼" : "▶"}
					</ToggleButton>

					{isOldVideoOpen && <YoutubeZero />}
				</YoutubeContainer>
				<EventContainer>
					<Event />
				</EventContainer>
			</ViewContainer>
			<LinkContainer>
				<LinkPage />
			</LinkContainer>
		</WholeContainer>
		// </BackgroundContainer>
	);
}

const BackgroundContainer = styled.div`
	width: 100%;
	height: 100vh;
	background-color: white;
`;

const WholeContainer = styled.div`
	width: 100%;
	height: 100vh;
	background-color: red;

`;

const YoutubeContainer = styled.div`
	width: 100%;
	height: auto;
	min-height: 100vh;
	margin-top: 2rem;
	margin-bottom: 2rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const YoutubeBox = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100vh;
	gap: 4rem;
	padding: 0 2rem;

	@media (max-width: 768px) {
    flex-direction: column;  // 모바일에서는 세로 배치
    height: auto;  // 높이를 자동으로 조정
    padding: 2rem 0;  // 상하 여백 추가
	gap: 4rem;
	
  }
	
`;
const ToggleButton = styled.button`
  background-color: #ff758c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin: 2rem 0;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ff8da1;
    transform: translateY(-2px);
  }
`;

const EventContainer = styled.div`
	width: 100%;
	min-height: 150vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: start;
	
`;

const ViewContainer = styled.div`
	width: 100%;
	height: auto;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	position: relative;
	margin-bottom: 10rem;

	@media (max-width: 768px) {
        min-height: 180vh;
		margin-bottom: 10rem;
		
	}
`;

const LinkContainer = styled.div`
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: white;
	position: relative;
	padding: 2rem 0;
	margin-top: 0;

	@media (max-width: 768px) {
		min-height: 80vh;
		padding: 2rem 0;
		margin-bottom: 100px;

	}
`;

const PageContainer = styled.div`
	width: 100%;
	height: 100vh;
	position: relative;
	left: 0;
	background: linear-gradient(to right, #ff758c, #ffffff);
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
	z-index: 2;

	@media (max-width: 768px) {
		height: 100vh;
		background-size: cover;
		display: flex;
		align-items: center;
		justify-content: center;
	}
`;

const Overlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 3;
`;

const TextContainer = styled.div`
	position: absolute;
	bottom: 10%;
	left: 35%;
	transform: translateX(-50%);
	z-index: 10;
	text-align: start;

	@media (max-width: 768px) {
		bottom: 10%;
		left: 20px;
		transform: none;
		width: 90%;
		padding: 0;
	}
`;

const Title = styled.h1`
	font-size: clamp(1.5rem, 5vw, 4.5rem);
	font-weight: bold;
	color: white;
	white-space: nowrap;

	@media (max-width: 768px) {
		font-size: clamp(1.5rem, 2vw, 2rem);
		white-space: normal;
		text-align: left;
	}
`;

const Description = styled.p`
	font-size: clamp(1rem, 3vw, 2.25rem);
	color: white;
	margin-top: -0.25rem;
	white-space: nowrap;

	@media (max-width: 768px) {
		font-size: clamp(0.9rem, 2.5vw, 1.5rem);
		white-space: normal;
		text-align: left;
	
	}
`;
