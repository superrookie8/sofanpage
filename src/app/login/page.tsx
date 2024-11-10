"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRecoilState, useSetRecoilState } from "recoil";
import { nicknameState } from "@/states/nicknameState";
import { passwordState } from "@/states/passwordState";
import { loginState } from "@/states/loginState"; // Import the login state
import EyeIcon from "@/icons/eyeicon";

interface ValidationState {
	message: string;
	color: string;
}

const Spinner = () => (
	<svg
		className="animate-spin h-5 w-5 text-white"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
	>
		<circle
			className="opacity-25"
			cx="12"
			cy="12"
			r="10"
			stroke="currentColor"
			strokeWidth="4"
		></circle>
		<path
			className="opacity-75"
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
		></path>
	</svg>
);

const Login: React.FC = () => {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [nicknameMessage, setNicknameMessage] = useState<ValidationState>({
		message: "",
		color: "red",
	});
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [nickname, setNickname] = useState<string>("");
	const [password, setPassword] = useRecoilState<string>(passwordState);
	const [passwordValid, setPasswordValid] = useState<ValidationState>({
		message: "",
		color: "black",
	});
	const [formValid, setFormValid] = useState(false);
	const setIsLoggedIn = useSetRecoilState(loginState); // Set the login state
	const [isLoading, setIsLoading] = useState(false);

	const [isLoggedIn] = useRecoilState(loginState);

	// 로그인 상태 체크 및 리다이렉트
	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (token || isLoggedIn) {
			router.push("/home");
		}
	}, [router, isLoggedIn]);

	const checkFormValid = useCallback(() => {
		return nickname.trim() !== "" && password.trim() !== "";
	}, [nickname, password]);

	useEffect(() => {
		setFormValid(checkFormValid());
	}, [nickname, password, checkFormValid]);

	useEffect(() => {
		if (nickname === undefined) setNickname("");
		if (password === undefined) setPassword("");
	}, [nickname, password, setNickname, setPassword]);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setNickname(value);
		if (!value.trim()) {
			setNicknameMessage({ message: "아이디가 없습니다", color: "red" });
			setFormValid(false);
		} else {
			setNicknameMessage({ message: "", color: "red" });
		}
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setPassword(value);
		setFormValid(checkFormValid());
		if (!value.trim()) {
			setPasswordValid({
				message: "비밀번호를 잘못 입력하셨습니다",
				color: "red",
			});
		} else {
			const regex =
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$^&*-]).{8,}$/;
			setPasswordValid(
				regex.test(value)
					? { message: "올바른 형태입니다", color: "blue" }
					: {
							message:
								"비밀번호는 8자 이상이며, 대문자, 소문자, 숫자와 특수문자를 포함해야 합니다.",
							color: "black",
					  }
			);
		}
	};

	const LoginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formValid) return;
		setIsLoading(true); // Start loading
		try {
			const response = await fetch("/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ nickname, password }),
			});
			const data = await response.json();
			if (response.ok) {
				sessionStorage.setItem("token", data.access_token);
				setIsLoggedIn(true);
				router.push("/home");
			} else {
				setMessage(data.msg);
			}
		} catch (error) {
			console.error("Login error:", error);
			setMessage("로그인 중 오류가 발생했습니다.");
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	useEffect(() => {
		return () => {
			setNickname("");
			setPassword("");
		};
	}, [setNickname, setPassword]);

	return (
		<div className="w-full h-screen flex flex-col justify-center items-center p-4 overflow-y-hidden">
			<div className="w-full max-w-[500px] h-[60px] bg-red-500 flex justify-center items-center relative rounded-tl-md rounded-tr-md text-xl font-bold text-white">
				SUPER SOHEE
			</div>

			<form
				onSubmit={LoginHandler}
				className="w-full max-w-[500px] h-auto bg-red-200 flex flex-col justify-center items-center rounded-bl-md rounded-br-md p-4"
			>
				<div className="w-full max-w-[500px] h-auto bg-red-200 flex flex-col justify-center items-center p-4">
					<div className="w-full max-w-[400px]">
						<input
							className="pl-3 pr-20 w-full focus:outline-none focus:border-transparent rounded-md"
							type="text"
							name="nickname"
							value={nickname || ""}
							onChange={handleNicknameChange}
							placeholder="닉네임"
							autoComplete="username"
							style={{
								fontFamily:
									'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
								wordBreak: "keep-all",
								WebkitTextSizeAdjust: "100%",
								textSizeAdjust: "100%",
							}}
						></input>
						<div
							className="w-full  mt-2"
							style={{
								fontSize: "10px",
								color: nicknameMessage.color,
								fontFamily:
									'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
								wordBreak: "keep-all",
								WebkitTextSizeAdjust: "100%",
								textSizeAdjust: "100%",
							}}
						>
							{nicknameMessage.message}
						</div>
					</div>
				</div>
				<div className="w-full max-w-[500px] h-auto bg-red-200 flex flex-col justify-center items-center p-4">
					<div className="relative w-full max-w-[400px] flex justify-center items-center">
						<input
							className="pl-3 pr-20 w-full focus:outline-none focus:border-transparent rounded-md"
							type={showPassword ? "text" : "password"}
							name="password"
							value={password || ""}
							onChange={handlePasswordChange}
							autoComplete="current-password"
							placeholder="비밀번호"
							style={{
								fontFamily:
									'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
								wordBreak: "keep-all",
								WebkitTextSizeAdjust: "100%",
								textSizeAdjust: "100%",
							}}
						/>
						<button
							onClick={togglePasswordVisibility}
							className="absolute right-0 top-0 bottom-0 px-3 flex items-center"
							aria-label="password visibility"
							type="button"
						>
							<EyeIcon visible={showPassword} size="24" color="black" />
						</button>
					</div>
					<div
						className="w-full mt-2 ml-10"
						style={{
							fontSize: "10px",
							color: passwordValid.color,
							fontFamily:
								'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
							wordBreak: "keep-all",
							WebkitTextSizeAdjust: "100%",
							textSizeAdjust: "100%",
						}}
					>
						{passwordValid.message}
					</div>
				</div>
				<div className="w-full max-w-[500px] h-[50px] flex justify-center items-center mt-4">
					<button
						type="submit"
						className={`w-[100px] h-[40px] flex justify-center items-center mr-4 rounded-md text-sm ${
							formValid ? "bg-red-500" : "bg-gray-300"
						}`}
						disabled={!formValid || isLoading}
					>
						{isLoading ? <Spinner /> : "로그인하기"}
					</button>
					<button
						onClick={() => {
							router.push("/signup");
						}}
						className="w-[100px] h-[40px] bg-green-200 flex justify-center items-center ml-4 rounded-md text-sm"
					>
						회원가입하기
					</button>
				</div>
			</form>
		</div>
	);
};

export default Login;
