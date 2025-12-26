import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const YoutubeTitle = () => {
	const [count, setCount] = useState(0);
	const [day, setDay] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const dayNumber = 2192;
	const targetNumber = 52608;
	const duration = 2000;
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setIsVisible(true);
				} else {
					setIsVisible(false);
					setCount(0);
					setDay(0); // 화면에서 벗어나면 카운트 리셋
				}
			},
			{ threshold: 0.1 } // 10% 이상 보일 때 실행
		);

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!isVisible) return;

		let startTime: number | null = null;
		let animationFrame: number;

		const animate = (currentTime: number) => {
			if (!startTime) startTime = currentTime;
			const progress = Math.min((currentTime - startTime) / duration, 1);

			const easeOutQuart = 1 - Math.pow(1 - progress, 4);
			const currentCount = Math.floor(easeOutQuart * targetNumber);
			const currentDay = Math.floor(easeOutQuart * dayNumber);

			setCount(currentCount);
			setDay(currentDay);
			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(animationFrame);
	}, [isVisible]); // isVisible이 변경될 때마다 실행

	return (
		<SoheeTitle ref={containerRef}>
			뜨거웠던 <NumberSpan>{day.toLocaleString()}</NumberSpan>일 <br />
			눈부셨던 <NumberSpan>{count.toLocaleString()}</NumberSpan>시간
		</SoheeTitle>
	);
};

export default YoutubeTitle;

const SoheeTitle = styled.div`
	text-align: center;
	font-size: 4rem;
	font-weight: bold;
	margin-top: 100px;
	margin-left: 17px;
	margin-right: 17px;

	@media (max-width: 768px) {
		font-size: 1.5rem;
	}
`;

const NumberSpan = styled.span`
	display: inline-block;
	min-width: 300px;  // 숫자 영역 고정 너비
	text-align: center;

	@media (max-width: 768px) {
		min-width: 110px;  // 모바일에서는 더 작은 너비
	}
`;
