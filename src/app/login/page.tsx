"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
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
	const { data: session } = useSession();
	const [message, setMessage] = useState("");
	const [emailMessage, setEmailMessage] = useState<ValidationState>({
		message: "",
		color: "red",
	});
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [passwordValid, setPasswordValid] = useState<ValidationState>({
		message: "",
		color: "black",
	});
	const [formValid, setFormValid] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// 로그인 상태 체크 및 리다이렉트
	useEffect(() => {
		if (session) {
			router.push("/home");
		}
	}, [session, router]);

	const checkFormValid = useCallback(() => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email) && password.trim() !== "";
	}, [email, password]);

	useEffect(() => {
		setFormValid(checkFormValid());
	}, [email, password, checkFormValid]);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setEmail(value);
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!value.trim()) {
			setEmailMessage({ message: "이메일을 입력해주세요", color: "red" });
		} else if (!emailRegex.test(value)) {
			setEmailMessage({
				message: "올바른 이메일 형식이 아닙니다",
				color: "red",
			});
		} else {
			setEmailMessage({ message: "", color: "red" });
		}
		setFormValid(checkFormValid());
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setPassword(value);
		setFormValid(checkFormValid());
		if (!value.trim()) {
			setPasswordValid({
				message: "비밀번호를 입력해주세요",
				color: "red",
			});
		} else {
			setPasswordValid({ message: "", color: "black" });
		}
	};

	const LoginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formValid) return;
		setIsLoading(true);
		setMessage("");

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
			} else if (result?.ok) {
				router.push("/home");
			}
		} catch (error) {
			console.error("Login error:", error);
			setMessage("로그인 중 오류가 발생했습니다.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleLogin = () => {
		signIn("google", { callbackUrl: "/home" });
	};

	return (
		<div className="w-full h-screen flex flex-col justify-center items-center p-4 overflow-y-hidden">
			<div className="w-full max-w-[500px] h-[60px] bg-red-500 flex justify-center items-center relative rounded-tl-md rounded-tr-md text-xl font-bold text-white z-10">
				SUPER SOHEE
			</div>

			<form
				onSubmit={LoginHandler}
				className="relative w-full max-w-[500px] bg-red-200 flex flex-col justify-center items-center rounded-bl-md rounded-br-md p-4"
			>
				<div className="w-full h-auto flex flex-col justify-center items-center p-4">
					<div className="relative w-full max-w-[400px]">
						<input
							className="pl-3 pr-20 w-full h-[40px] bg-white border border-gray-300 focus:outline-none focus:border-transparent rounded-md"
							type="email"
							name="email"
							value={email || ""}
							onChange={handleEmailChange}
							placeholder="이메일"
							autoComplete="email"
							style={{
								fontFamily:
									'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
								wordBreak: "keep-all",
								WebkitTextSizeAdjust: "100%",
								textSizeAdjust: "100%",
							}}
						></input>
						<div
							className="w-full mt-2"
							style={{
								fontSize: "10px",
								color: emailMessage.color,
								fontFamily:
									'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
								wordBreak: "keep-all",
								WebkitTextSizeAdjust: "100%",
								textSizeAdjust: "100%",
							}}
						>
							{emailMessage.message}
						</div>
					</div>
				</div>
				<div className="w-full h-auto flex flex-col justify-center items-center p-4">
					<div className="relative w-full max-w-[400px] flex justify-center items-center">
						<input
							className="pl-3 pr-20 w-full h-[40px] bg-white border border-gray-300 focus:outline-none focus:border-transparent rounded-md"
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
					{message && (
						<div
							className="w-full mt-2 text-red-600 ml-[36px]"
							style={{
								fontSize: "12px",
								fontFamily:
									'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
							}}
						>
							{message}
						</div>
					)}
				</div>
				<div className="relative w-full h-[50px] flex justify-center items-center mt-4 ">
					<button
						type="submit"
						className={`w-[100px] h-[40px] flex justify-center items-center mr-4 rounded-md text-sm hover:cursor-pointer ${
							formValid ? "bg-red-500 text-white " : "bg-gray-300 text-gray-500"
						}`}
						disabled={!formValid || isLoading}
					>
						{isLoading ? <Spinner /> : "로그인하기"}
					</button>
					<button
						onClick={() => {
							router.push("/signup");
						}}
						className="w-[100px] h-[40px] bg-red-300 flex justify-center items-center ml-4 rounded-md text-sm text-white hover:cursor-pointer"
					>
						회원가입하기
					</button>
				</div>
				<button
					onClick={handleGoogleLogin}
					className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					Google로 로그인
				</button>
			</form>
		</div>
	);
};

export default Login;
