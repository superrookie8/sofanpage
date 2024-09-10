import React, { useEffect, useRef, useState } from "react";

const BrickBreakerGame = ({ onGameOver, currentGame, difficulty }) => {
	const canvasRef = useRef(null);
	const [gameInitialized, setGameInitialized] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			console.error("Canvas not found");
			return;
		}

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			console.error("Context not found");
			return;
		}

		const background = new Image();
		const brickImages = [
			"images/team_mascot_01.png",
			"images/team_mascot_03.png",
			"images/team_mascot_05.png",
			"images/team_mascot_07.png",
			"images/team_mascot_09.png",
		];

		background.src = "images/team_mascot_11.png";

		const brickImage = new Image();
		brickImage.src = brickImages[currentGame];

		let x = canvas.width / 2;
		let y = canvas.height - 30;
		let dx = 2;
		let dy = -2;
		const ballRadius = 8;
		const paddleHeight = 8;
		const paddleWidth = difficulty === "easy" ? 150 : 50;
		let paddleX = (canvas.width - paddleWidth) / 2;

		const brickRowCount = 15;
		const brickColumnCount = 6;
		const brickWidth = canvas.width / brickColumnCount;
		const brickHeight = 20;
		const brickPadding = 0;
		const brickOffsetTop = 30;
		const brickOffsetLeft = 0;

		let bricks = [];
		for (let c = 0; c < brickColumnCount; c++) {
			bricks[c] = [];
			for (let r = 0; r < brickRowCount; r++) {
				bricks[c][r] = { x: 0, y: 0, status: 1 };
			}
		}

		let bricksBroken = 0;

		document.addEventListener("mousemove", mouseMoveHandler, false);

		function mouseMoveHandler(e) {
			const relativeX = e.clientX - canvas.offsetLeft;
			if (relativeX > 0 && relativeX < canvas.width) {
				paddleX = relativeX - paddleWidth / 2;
			}
		}

		function collisionDetection() {
			for (let c = 0; c < brickColumnCount; c++) {
				for (let r = 0; r < brickRowCount; r++) {
					const b = bricks[c][r];
					if (b.status === 1) {
						if (
							x > b.x &&
							x < b.x + brickWidth &&
							y > b.y &&
							y < b.y + brickHeight
						) {
							dy = -dy;
							b.status = 0;
							bricksBroken++;
							if (bricksBroken === brickRowCount * brickColumnCount) {
								onGameOver(true);
							}
						}
					}
				}
			}
		}

		function drawBall() {
			ctx.beginPath();
			ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
			ctx.fillStyle = "#FF0000";
			ctx.fill();
			ctx.closePath();
		}

		function drawPaddle() {
			ctx.beginPath();
			ctx.rect(
				paddleX,
				canvas.height - paddleHeight,
				paddleWidth,
				paddleHeight
			);
			ctx.fillStyle = "#FF0000";
			ctx.fill();
			ctx.closePath();
		}

		function drawBricks() {
			for (let c = 0; c < brickColumnCount; c++) {
				for (let r = 0; r < brickRowCount; r++) {
					if (bricks[c][r].status === 1) {
						const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
						const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
						bricks[c][r].x = brickX;
						bricks[c][r].y = brickY;
						ctx.drawImage(
							brickImage,
							c * (brickImage.width / brickColumnCount),
							r * (brickImage.height / brickRowCount),
							brickImage.width / brickColumnCount,
							brickImage.height / brickRowCount,
							brickX,
							brickY,
							brickWidth,
							brickHeight
						);
					}
				}
			}
		}

		function drawBackground() {
			ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		}

		function draw() {
			if (!gameInitialized) return;

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawBackground();
			drawBricks();
			drawBall();
			drawPaddle();
			collisionDetection();

			if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
				dx = -dx;
			}
			if (y + dy < ballRadius) {
				dy = -dy;
			} else if (y + dy > canvas.height - ballRadius) {
				if (x > paddleX && x < paddleX + paddleWidth) {
					dy = -dy;
				} else {
					onGameOver(false);
					return;
				}
			}

			x += dx;
			y += dy;
			requestAnimationFrame(draw);
		}

		function initializeGame() {
			setGameInitialized(true);
			draw();
		}

		brickImage.onload = () => {
			initializeGame();
		};

		return () => {
			document.removeEventListener("mousemove", mouseMoveHandler);
		};
	}, [onGameOver, currentGame, difficulty, gameInitialized]);

	return (
		<canvas
			ref={canvasRef}
			width="300"
			height="500"
			style={{ display: "block", margin: "0 auto" }}
		/>
	);
};

export default BrickBreakerGame;
