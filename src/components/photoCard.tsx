import { useState, useEffect } from "react";
import { useSprings, animated, to as interpolate } from "@react-spring/web";
import { useDrag } from "react-use-gesture";

interface MockData {
	photo: string;
	text: string;
	date: string;
	time: string;
}

const mockData: MockData[] = [
	{
		photo:
			"https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg",
		text: "이건글",
		date: "이거남긴날짜",
		time: "이거남긴시간",
	},
	{
		photo: "/images/photos/face2.png",
		text: "저건글",
		date: "저거남긴날짜",
		time: "저거남긴시간",
	},
	{
		photo: "/images/photos/face3.png",
		text: "그건글",
		date: "그거남긴날짜",
		time: "그거남긴시간",
	},
	{
		photo: "/images/photos/face4.png",
		text: "요건글",
		date: "요거남긴날짜",
		time: "요거남긴시간",
	},
];

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i: number) => ({
	x: 0,
	y: i * -4,
	scale: 0.1,
	rot: -10 + Math.random() * 20,
	delay: i * 100,
});
const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r: number, s: number) =>
	`perspective(1500px) rotateX(30deg) rotateY(${
		r / 10
	}deg) rotateZ(${r}deg) scale(${s})`;

function PhotoCard() {
	const [gone] = useState(() => new Set());
	const [props, api] = useSprings(mockData.length, (i) => ({
		...to(i),
		from: from(i),
	}));

	const bind = useDrag(
		({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
			console.log(
				`Current image URL for card ${index}:`,
				mockData[index].photo
			);
			const trigger = velocity > 0.2;
			const dir = xDir < 0 ? -1 : 1;
			if (!down && trigger) gone.add(index);
			api.start((i) => {
				if (index !== i) return;
				const isGone = gone.has(index);
				const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
				const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0);
				const scale = down ? 1.1 : 1;
				// console.log(isGone, "이즈곤이뭐야");
				return {
					x,
					rot,
					scale,
					delay: undefined,
					config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
				};
			});
			if (!down && gone.size === mockData.length)
				setTimeout(() => {
					gone.clear();
					api.start((i) => to(i));
				}, 600);
		}
	);

	return (
		<>
			{props.map(({ x, y, rot, scale }, i) => (
				<animated.div
					key={i}
					{...bind(i)}
					style={{ x, scale }}
					className="bg-red-700 w-[200px] h-[250px] rounded-lg p-6 absolute  flex justify-center items-center "
				>
					<animated.div
						{...bind(i)}
						style={{
							x,
							backgroundImage: `url(${mockData[i].photo})`,
						}}
						className="bg-green-200 flex items-center justify-center h-[200px] w-[150px] "
					/>
					{/* 여기에 카드 내용 렌더링 */}
					<div className="p-4 text-center">
						<div>{mockData[i].text}</div>
						<div>{mockData[i].date}</div>
						<div>{mockData[i].time}</div>
					</div>
				</animated.div>
			))}
		</>
	);
}

export default PhotoCard;
