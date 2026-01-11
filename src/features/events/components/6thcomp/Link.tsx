import Link from "next/link";
import React from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LinkPage = () => {
	const router = useRouter();

	const handleClick = () => {
		router.push("/5th");
	};
	return (
		<LinkContainer>
			<StyledLink
				href="https://bnksumbasket.com/"
				target="_blank"
				rel="noopener noreferrer"
			>
				<LinkButton>BNK SUM 여자프로농구단 홈페이지 이동</LinkButton>
			</StyledLink>
			<StyledLink
				href="https://www.instagram.com/bnksum.basketball/"
				target="_blank"
				rel="noopener noreferrer"
			>
				<LinkButton>BNK SUM 공식 인스타그램 이동</LinkButton>
			</StyledLink>
			<StyledLink
				href="https://www.youtube.com/@bnktv9784"
				target="_blank"
				rel="noopener noreferrer"
			>
				<LinkButton>BNK SUM 공식 유튜브 채널 이동</LinkButton>
			</StyledLink>
			<StyledLink
				href="https://wkbl.or.kr/main/"
				target="_blank"
				rel="noopener noreferrer"
			>
				<LinkButton>WKBL 홈페이지 이동</LinkButton>
			</StyledLink>

			<StyledLink
				href="https://supersohee.com"
				target="_blank"
				rel="noopener noreferrer"
			>
				<LinkButton>슈퍼소히 팬페이지 이동</LinkButton>
			</StyledLink>
			<LinkButton onClick={handleClick}>5주년 기념페이지 바로가기</LinkButton>

			<Image
				src="/6th/smallcard.webp"
				alt="지하철 광고"
				width={300}
				height={300}
				style={
					{
						marginTop: "2rem",
						borderRadius: "10px",
						backgroundColor: "gray",
						boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
						pointerEvents: "none",
						userSelect: "none",
					} as React.CSSProperties
				}
				draggable={false}
				onContextMenu={(e) => e.preventDefault()}
			/>
		</LinkContainer>
	);
};

export default LinkPage;

const LinkContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	align-items: center;
	width: 100%;
	max-width: 340px;
	margin: 0 0;
`;

const StyledLink = styled(Link)`
	text-decoration: none;
	width: 100%;
`;

const LinkButton = styled.div`
	display: block;
	width: 100%;
	padding: 12px 24px;
	background-color: #ff758c;
	color: white;
	border-radius: 8px;
	font-weight: 600;
	transition: all 0.3s ease;
	cursor: pointer;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	text-align: center;

	&:hover {
		transform: translateY(-2px);
		background-color: #ff8da1;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 768px) {
		padding: 10px 0px;
		font-size: 0.9rem;
	}
`;
