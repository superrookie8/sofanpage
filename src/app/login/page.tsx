"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { nicknameState } from "@/states/nicknameState";
import { passwordState } from "@/states/passwordState";
import EyeIcon from "@/icons/eyeicon";
import Image from "next/image";

interface ValidationState {
	message: string;
	color: string;
}

const Login: React.FC = () => {
	const router = useRouter();
	const [message, setMessage] = useState("");
	// const [nicknameChecked, setNicknameChecked] = useState(false);
	const [nicknameMessage, setNicknameMessage] = useState<ValidationState>({
		message: "",
		color: "red",
	});
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [nickname, setNickname] = useRecoilState<string>(nicknameState);
	const [password, setPassword] = useRecoilState<string>(passwordState);
	const [passwordValid, setPasswordValid] = useState<ValidationState>({
		message: "",
		color: "black",
	});

	const [formValid, setFormValid] = useState(false);

	useEffect(() => {
		setFormValid(checkFormValid());
	}, [nickname, password]);

	const checkFormValid = () => {
		return nickname.trim() !== "" && password.trim() !== "";
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setNickname(value);
		if (!value.trim()) {
			setNicknameMessage({ message: "", color: "" }); // 닉네임 입력창이 비어있으면 메시지를 비웁니다.
			setFormValid(false);
		}
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;

		setPassword(value);
		setFormValid(checkFormValid());
		if (!value.trim()) {
			setPasswordValid({ message: "", color: "" });
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

		const response = await fetch("/api/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ nickname, password }),
		});

		const data = await response.json();

		if (response.ok) {
			localStorage.setItem("token", data.access_token);
			router.push("/home");
		} else {
			setMessage(data.msg);
		}
	};
	return (
		<div className="w-full h-screen flex flex-col justify-center items-center">
			<div className="w-[500px] h-[60px] bg-red-500 flex justify-center items-center relative rounded-tl-md rounded-tr-md ">
				<Image
					src="/images/supersohee2.png"
					alt="LOGO Image"
					layout="fill"
					objectFit="contain"
				/>
			</div>
			<form
				onSubmit={LoginHandler}
				className="w-[500px] h-[230px] bg-red-300 flex flex-col justify-center items-center rounded-bl-md rounded-br-md"
			>
				<div className="w-[500px] h-[60px] bg-red-300 flex flex-col justify-center items-center p-8">
					<div className="w-[400px]">
						<input
							className="pl-3 pr-20 w-[400px] focus:outline-none focus:border-transparent rounded-md"
							name="nickname"
							value={nickname}
							onChange={handleNicknameChange}
							placeholder="닉네임"
						></input>
						<div
							className="w-[400px] bg-yellow-300"
							style={{ fontSize: "10px", color: nicknameMessage.color }}
						>
							{nicknameMessage.message}
						</div>
					</div>
				</div>
				<div className="w-[500px] h-[60px] bg-red-300 flex flex-col justify-center items-center p-8">
					<div className="relative w-[400px] flex justify-center items-center ">
						<input
							className="pl-3 pr-20 w-full focus:outline-none focus:border-transparent rounded-md"
							type={showPassword ? "text" : "password"}
							name="password"
							onChange={handlePasswordChange}
							placeholder="비밀번호"
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
						className="w-[400px]"
						style={{ fontSize: "10px", color: passwordValid.color }}
					>
						{passwordValid.message}
					</div>
				</div>
				<div className="w-[500px] h-[50px]  flex justify-center items-center mt-4">
					<button
						type="submit"
						className={`w-[100px] h-[40px] flex justify-center items-center mr-8 rounded-md ${
							formValid ? "bg-red-500" : "bg-gray-300"
						}`}
						disabled={!formValid}
					>
						로그인하기
					</button>
					<button
						onClick={() => {
							router.push("/signup");
						}}
						className="w-[100px] h-[40px] bg-green-200 flex justify-center items-center ml-8 rounded-md"
					>
						회원가입하기
					</button>
				</div>
			</form>
		</div>
	);
};

export default Login;
