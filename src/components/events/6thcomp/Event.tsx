import React, { useState } from "react";
import styled from "styled-components";
import Image from "next/image";
const Event = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<EventBox>
			<EventTitle>
				이소희 선수 <br /> 프로데뷔 6주년 축하 이벤트
			</EventTitle>
			<p>지하철 광고 게첨중</p>
			<p>부산 지하철 3호선 종합운동장역 9번출구쪽</p>
			<Image
				src="/6th/subway.webp"
				alt="지하철 광고"
				width={300}
				height={300}
			/>
			<EventDescription>
				이소희 선수 프로데뷔 6주년을 축하하는
				<br /> 지하철 광고와 경기 직관을 <br />
				인증하시면 소정의 굿즈를 드립니다!
			</EventDescription>

			<GoodsContainer>
				<GoodsItem>
					<GoodsImage src="/6th/photocardimg.webp" alt="랜덤포카" />
					<GoodsText>랜덤포카 3종</GoodsText>
				</GoodsItem>
				<GoodsItem>
					<GoodsImage src="/6th/ducksohee.webp" alt="오리소히 키링" />
					<GoodsText>오리소히 키링</GoodsText>
				</GoodsItem>
				<GoodsItem>
					<GoodsImage src="/6th/renticurl2.webp" alt="렌티큘러" />
					<GoodsText>
						어린이소히 <br /> 렌티큘러
					</GoodsText>
				</GoodsItem>
			</GoodsContainer>

			<ToggleSection>
				<ToggleButton onClick={() => setIsOpen(!isOpen)}>
					참여방법 {isOpen ? "▼" : "▶"}
				</ToggleButton>

				{isOpen && (
					<MethodBox>
						<MethodText>
							참여기간 : 2025년 1월 15일 ~ 1월 30일
							<br />
							홈경기 : 1/16(목), 1/24(금), 1/30(목)
							<br />
							<br />
							참여방법 : 하단의 방법 중 하나를 선택하셔서 인증해주시면 됩니다!
							<br />
							<br />
							&lt;인스타그램&gt;
							<br />
							1. 지하철 광고와 경기장 방문 인증샷을 찍어주세요!
							<br />
							2. 인스타그램에 해시태그와 함께 게시해주세요. (게시글, 스토리 다
							좋아요!)
							<br />
							#이소희_6주년 #BNK썸_이소희 #축하해 #WKBL
							<br />
							언급 추가 : @hahanana20c
							<br />
							<br />
							&lt;슈퍼소히 웹사이트&gt;
							<br />
							1. 지하철 광고와 경기장 방문 인증샷을 찍어주세요!
							<br />
							2. www.supersohee.com 에 접속해주세요
							<br />
							3. 회원가입/로그인 후 직관일지를 남겨주세요!
							<br />
							<br />
							<LinkButton href="https://www.supersohee.com">
								슈퍼소히 웹사이트 바로가기
							</LinkButton>
						</MethodText>
					</MethodBox>
				)}
			</ToggleSection>

			<EventFooter>
				인증 이벤트 참여하신 분들중 추첨을 통해 <br /> 1분께 굿즈 티셔츠
				드리겠습니다!!
			</EventFooter>
			<FooterImage src="/6th/tshirts.webp" alt="소히 티셔츠" />
			<p>
				2/14 (금) 또는 2/22 (토) 홈경기 직접 수령 또는 배송 요청
				<br /> 이벤트 기간 직후 공지하겠습니다..!
			</p>
		</EventBox>
	);
};

export default Event;

const EventBox = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: start;
	width: 100%;
	min-height: auto;
	background: linear-gradient(to bottom, #ff758c, #ffffff);
	padding: 4rem 1rem;
	margin-bottom: 4rem;

	@media (max-width: 768px) {
		min-height: auto;
		padding: 2rem 1rem;
		margin-bottom: 2rem;
	}
`;

const EventTitle = styled.h1`
	font-size: 2.5rem;
	font-weight: 800;
	color: #333;
	text-align: center;
	line-height: 1.4;
	margin-bottom: 2rem;
	
	@media (max-width: 768px) {
		font-size: 1.8rem;
	}
`;

const EventDescription = styled.p`
	font-size: 1.25rem;
	line-height: 1.6;
	text-align: center;
	color: #444;
	max-width: 800px;
	margin: 0, auto;
	margin-top: 2rem;
	
	@media (max-width: 768px) {
		font-size: 1rem;
		padding: 0 1rem;
	}
`;

const GoodsContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	gap: 1.5rem;
	margin: 2rem 0;
	width: 100%;
	max-width: 600px;
`;

const GoodsItem = styled.div`
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 1.5rem;

`;

const GoodsImage = styled.img`
	width: 120px;
	height: 120px;
	object-fit: contain;
	background-color: #fff;
	border-radius: 8px;
	user-select: none;
	pointer-events: none;
	-webkit-user-drag: none;
	-webkit-touch-callout: none;
`;

const GoodsText = styled.p`
	font-size: 1.2rem;
	color: #333;
	text-align: center;

    @media (max-width: 768px) {
		font-size: 0.8rem;
		
	}
`;

const EventFooter = styled.p`
	font-size: 1.2rem;
	color: #333;
	text-align: center;
	margin-top: 2rem;
	font-weight: bold;
`;

const FooterImage = styled.img`
	width: 300px;
	height: auto;
	margin-top: 2rem;
	margin-bottom: 4rem;
	object-fit: contain;
	user-select: none;
	pointer-events: none;
	-webkit-user-drag: none;
	-webkit-touch-callout: none;
	
	@media (max-width: 768px) {
		width: 200px;
		margin-bottom: 2rem;
	}
`;

const ToggleSection = styled.div`
	width: 100%;
	max-width: 600px;
	margin: 2rem 0;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const MethodBox = styled.div`
	background-color: #fff;
	padding: 1.5rem;
	border-radius: 8px;
	margin-top: 1rem;
	width: 100%;
	border: 1px solid #ff758c;
`;

const ToggleButton = styled.button`
	background-color: #ff758c;
	color: white;
	border: none;
	padding: 10px 20px;
	border-radius: 8px;
	cursor: pointer;
	font-size: 1rem;
	transition: all 0.3s ease;

	&:hover {
		background-color: #ff8da1;
		transform: translateY(-2px);
	}
`;

const MethodText = styled.p`
	font-size: 1.1rem;
	line-height: 1.6;
	color: #333;
	text-align: left; 

	@media (max-width: 768px) {
		font-size: 0.8rem;
	}
`;

const LinkButton = styled.a`
	background-color: #ff758c;
	color: white;
	border: none;
	padding: 10px 20px;
	border-radius: 8px;
	cursor: pointer;
	font-size: 1rem;
	transition: all 0.3s ease;

`;
