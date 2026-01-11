"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import clientAxiosService from "@/lib/client/http/axiosService";
import EyeIcon from "@/icons/eyeicon";
import AlertModal from "@/shared/ui/alertModal";

interface ValidationState {
	message: string;
	color: string;
}

const SignUp: React.FC = () => {
	const router = useRouter();
	const [message, setMessage] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [emailChecked, setEmailChecked] = useState<boolean>(false);
	const [emailMessage, setEmailMessage] = useState<ValidationState>({
		message: "",
		color: "red",
	});
	const [nicknameMessage, setNicknameMessage] = useState<ValidationState>({
		message: "",
		color: "red",
	});
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showPasswordConfirm, setShowPasswordConfirm] =
		useState<boolean>(false);
	const [nickname, setNickname] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [passwordConfirm, setPasswordConfirm] = useState<string>("");
	const [passwordValid, setPasswordValid] = useState<ValidationState>({
		message: "",
		color: "black",
	});
	const [passwordConfirmValid, setPasswordConfirmValid] =
		useState<ValidationState>({
			message: "",
			color: "black",
		});

	const [formValid, setFormValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [modalMessage, setModalMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const checkFormValid = useCallback(() => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const nicknameValid =
			nickname.trim().length >= 2 && nickname.trim().length <= 20;
		return (
			emailRegex.test(email) &&
			emailChecked &&
			nicknameValid &&
			password.trim().length >= 8 &&
			password === passwordConfirm
		);
	}, [email, emailChecked, nickname, password, passwordConfirm]);

	useEffect(() => {
		setFormValid(checkFormValid());
	}, [
		email,
		emailChecked,
		nickname,
		password,
		passwordConfirm,
		checkFormValid,
	]);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const togglePasswordConfirmVisibility = () => {
		setShowPasswordConfirm(!showPasswordConfirm);
	};

	// 이메일 중복 확인 (실시간)
	const checkEmailExists = async (emailValue: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailValue)) {
			setEmailChecked(false);
			return;
		}

		try {
			// Next.js API Route 사용
			const response = await clientAxiosService.get(
				`/api/auth/check-email?email=${encodeURIComponent(emailValue)}`
			);

			const data = response.data;

			if (data.exists) {
				setEmailMessage({
					message: "이미 사용 중인 이메일입니다",
					color: "red",
				});
				setEmailChecked(false);
			} else {
				setEmailMessage({ message: "사용 가능한 이메일입니다", color: "blue" });
				setEmailChecked(true);
			}
		} catch (error) {
			setEmailMessage({
				message: "이메일 확인 중 오류가 발생했습니다",
				color: "red",
			});
			setEmailChecked(false);
		}
	};

	const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setEmail(value);
		setEmailChecked(false);
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!value.trim()) {
			setEmailMessage({ message: "이메일을 입력해주세요", color: "red" });
		} else if (!emailRegex.test(value)) {
			setEmailMessage({
				message: "올바른 이메일 형식이 아닙니다",
				color: "red",
			});
		} else {
			// 이메일 형식이 맞으면 중복 확인
			checkEmailExists(value);
		}
		setFormValid(checkFormValid());
	};

	const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setNickname(value);

		if (!value.trim()) {
			setNicknameMessage({ message: "닉네임을 입력해주세요", color: "red" });
		} else if (value.trim().length < 2) {
			setNicknameMessage({
				message: "닉네임은 2자 이상이어야 합니다",
				color: "red",
			});
		} else if (value.trim().length > 20) {
			setNicknameMessage({
				message: "닉네임은 20자 이하여야 합니다",
				color: "red",
			});
		} else {
			setNicknameMessage({ message: "", color: "" });
		}
		setFormValid(checkFormValid());
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setPassword(value);
		setFormValid(checkFormValid());

		if (!value.trim()) {
			setPasswordValid({ message: "", color: "" });
			setPasswordConfirmValid({ message: "", color: "" });
		} else if (value.length < 8) {
			setPasswordValid({
				message: "비밀번호는 최소 8자 이상이어야 합니다",
				color: "red",
			});
		} else {
			setPasswordValid({ message: "올바른 형태입니다", color: "blue" });
		}

		if (passwordConfirm) {
			setPasswordConfirmValid(
				value === passwordConfirm
					? { message: "비밀번호가 일치합니다", color: "blue" }
					: { message: "비밀번호가 일치하지 않습니다", color: "red" }
			);
		}
	};

	const handlePasswordConfirmChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const { value } = event.target;
		setPasswordConfirm(value);
		setFormValid(checkFormValid());

		if (!value.trim()) {
			setPasswordConfirmValid({ message: "", color: "" });
		} else {
			setPasswordConfirmValid(
				password === value
					? { message: "비밀번호가 일치합니다", color: "blue" }
					: { message: "비밀번호가 일치하지 않습니다", color: "red" }
			);
		}
	};

	const handleModalClose = () => {
		setShowModal(false);
	};

	const signUpHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formValid) return;

		setIsLoading(true);
		setMessage("");

		try {
			// Next.js API Route 사용
			const response = await clientAxiosService.post("/api/auth/signup", {
				email,
				password,
				passwordConfirm,
				nickname,
			});

			// 회원가입 성공 후 자동 로그인
			const loginResult = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (loginResult?.ok) {
				router.push("/home");
			} else {
				setMessage("회원가입은 완료되었습니다. 로그인 페이지로 이동합니다.");
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			}
		} catch (error: any) {
			console.error("SignUp Error", error);
			setMessage(
				error.response?.data?.message || "회원가입 처리 중 오류가 발생했습니다"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative w-full h-screen flex flex-col justify-center items-center p-4">
			<div className="w-full max-w-[500px] h-[80px] bg-red-500 flex justify-center items-center rounded-tl-md rounded-tr-md text-white text-xl font-bold">
				슈퍼소히
			</div>
			<form
				onSubmit={signUpHandler}
				className="w-full max-w-[500px] bg-red-200 flex flex-col justify-center items-center rounded-bl-md rounded-br-md  p-4"
			>
				<div className="w-full h-auto flex flex-col justify-center items-center">
					<div className="w-full max-w-[400px] flex justify-center items-center mt-5">
						<input
							className="pl-3 pr-20 w-full h-[40px] bg-white border border-gray-300 focus:outline-none focus:border-transparent rounded-md"
							type="email"
							name="email"
							value={email}
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
						/>
					</div>
					<div
						className="w-full max-w-[400px] mt-2 text-xs"
						style={{
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
				<div className="w-full h-auto flex flex-col justify-center items-center p-4">
					<div className="w-full max-w-[400px] flex justify-center items-center mt-5">
						<input
							className="pl-3 pr-20 w-full h-[40px] bg-white border border-gray-300 focus:outline-none focus:border-transparent rounded-md"
							name="nickname"
							value={nickname}
							onChange={handleNicknameChange}
							placeholder="닉네임"
							style={{
								fontFamily:
									'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
								wordBreak: "keep-all",
								WebkitTextSizeAdjust: "100%",
								textSizeAdjust: "100%",
							}}
						/>
					</div>
					<div
						className="w-full max-w-[400px] mt-2 text-xs"
						style={{
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
				<div className="w-full h-auto flex flex-col justify-center items-center p-4">
					<div className="relative w-full max-w-[400px] flex justify-center items-center mt-5">
						<input
							className="pl-3 pr-20 w-full h-[40px] bg-white border border-gray-300 focus:outline-none focus:border-transparent rounded-md"
							style={{
								fontFamily:
									'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
								wordBreak: "keep-all",
								WebkitTextSizeAdjust: "100%",
								textSizeAdjust: "100%",
							}}
							type={showPassword ? "text" : "password"}
							name="password"
							value={password}
							onChange={handlePasswordChange}
							placeholder="비밀번호"
						/>
						<button
							onClick={togglePasswordVisibility}
							className="absolute right-0 top-0 bottom-0 px-3 flex items-center font-[GmarketSansMedium]"
							aria-label="password visibility"
							type="button"
						>
							<EyeIcon visible={showPassword} size="24" color="black" />
						</button>
					</div>
					<div
						className="w-full max-w-[400px] mt-2 text-xs"
						style={{
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
				<div className="w-full h-auto flex flex-col justify-center items-center p-4">
					<div className="relative w-full max-w-[400px] flex justify-center items-center mt-5">
						<input
							className="pl-3 pr-10 w-full h-[40px] bg-white border border-gray-300 focus:outline-none focus:border-transparent rounded-md"
							type={showPasswordConfirm ? "text" : "password"}
							name="passwordConfirm"
							value={passwordConfirm}
							onChange={handlePasswordConfirmChange}
							placeholder="비밀번호 확인"
							style={{
								fontFamily:
									'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
								wordBreak: "keep-all",
								WebkitTextSizeAdjust: "100%",
								textSizeAdjust: "100%",
							}}
						/>
						<button
							onClick={togglePasswordConfirmVisibility}
							className="absolute right-0 top-0 bottom-0 px-3 flex items-center font-[GmarketSansMedium]"
							aria-label="passwordConfirm visibility"
							type="button"
						>
							<EyeIcon visible={showPasswordConfirm} size="24" color="black" />
						</button>
					</div>
					<div
						className="w-full max-w-[400px] mt-2 text-xs font-[GmarketSansMedium]"
						style={{
							color: passwordConfirmValid.color,
							fontFamily:
								'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
							wordBreak: "keep-all",
							WebkitTextSizeAdjust: "100%",
							textSizeAdjust: "100%",
						}}
					>
						{passwordConfirmValid.message}
					</div>
				</div>
				{message && (
					<div
						className="w-full max-w-[400px] mt-2 text-red-600 text-xs"
						style={{
							fontFamily:
								'GmarketSansMedium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
						}}
					>
						{message}
					</div>
				)}
				<div className="w-full h-[50px] flex justify-center items-center mt-4">
					<button
						type="submit"
						className={`w-full max-w-[250px] h-[40px] flex justify-center items-center rounded-md font-[GmarketSansMedium] ${
							formValid ? "bg-red-500 text-white" : "bg-gray-300 text-gray-500"
						}`}
						disabled={!formValid || isLoading}
					>
						{isLoading ? "처리 중..." : "가입하기"}
					</button>
				</div>
				<div className="text-blue-500 hover:text-blue-700 cursor-pointer mt-4 text-xs font-[GmarketSansMedium]">
					<Link href="/login">이미 아이디가 있습니다</Link>
				</div>
				<AlertModal
					isOpen={showModal}
					onClose={handleModalClose}
					message={modalMessage}
				/>
			</form>
		</div>
	);
};

export default SignUp;
