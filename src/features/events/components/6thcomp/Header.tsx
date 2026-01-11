"use client";

import styled from "styled-components";

const Header = () => {
	return (
		<HeaderContainer>
			<HeaderFont>
				<h1>농구선수 이소희 프로데뷔 6주년</h1>
			</HeaderFont>
		</HeaderContainer>
	);
};

export default Header;
const HeaderContainer = styled.div`
	width: 100%;
	height: 200px;
	padding-top: 30px;

	@media (max-width: 768px) {
		height: 70px;
		padding-top: 20px;
	}
`;

const HeaderFont = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	font-size: 100px;
	font-weight: bold;

	@media (max-width: 768px) {
		font-size: 24px;
	}
`;
