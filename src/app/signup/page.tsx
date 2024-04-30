"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { nicknameState } from "@/states/nicknameState";
import { passwordState } from "@/states/passwordState";
import EyeIcon from "@/icons/eyeicon";

interface ValidationState {
	message: string;
	color: string;
}

const SignUp: React.FC = () => {
	const router = useRouter();
	const [message, setMessage] = useState<string>("");
	const [nicknameChecked, setNicknameChecked] = useState(false);
	const [nicknameMessage, setNicknameMessage] = useState<ValidationState>({
		message: "",
		color: "red",
	});
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showPasswordConfirm, setShowPasswordConfirm] =
		useState<boolean>(false);
	const [nickname, setNickname] = useRecoilState<string>(nicknameState);
	const [password, setPassword] = useRecoilState<string>(passwordState);
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

	useEffect(() => {
		setFormValid(checkFormValid());
	}, [nickname, password, passwordConfirm, nicknameChecked]);

	const checkFormValid = () => {
		return (
			nickname.trim() !== "" &&
			password.trim() !== "" &&
			password === passwordConfirm &&
			nicknameChecked
		);
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const togglePasswordConfirmVisibility = () => {
		setShowPasswordConfirm(!showPasswordConfirm);
	};

	const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setNickname(value);
		if (!value.trim()) {
			setNicknameMessage({ message: "", color: "" }); // 닉네임 입력창이 비어있으면 메시지를 비웁니다.
			setFormValid(false);
		}
	};

	const nicknameHandler = () => {
		const option = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ nickname }),
		};
		fetch("/api/nicknamecheck", option)
			.then((res) => res.json())
			.then((data) => {
				const messageColor =
					data.msg === "이미 존재하는 닉네임입니다" ? "red" : "blue";
				setNicknameMessage({ message: data.msg, color: messageColor });
				console.log(data);
				if (data.msg === "가능한 닉네임입니다") {
					setNicknameChecked(true);
					setFormValid(checkFormValid());
				} else {
					setNicknameChecked(false);
					setFormValid(false);
				}
			})
			.catch((error) => {
				setNicknameMessage(
					{ message: "알수 없는 에러입니다", color: "red" } || error
				);
				setNicknameChecked(false);
			});
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;

		setPassword(value);
		setFormValid(checkFormValid());
		if (!value.trim()) {
			setPasswordValid({ message: "", color: "" });
			setPasswordConfirmValid({ message: "", color: "" }); // 비밀번호 입력창이 비어있으면 검증 메시지를 비웁니다.
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
		setPasswordConfirm(value); // 비밀번호 확인 입력 상태 업데이트
		setFormValid(checkFormValid());
		if (!value.trim()) {
			setPasswordConfirmValid({ message: "", color: "" }); // 비밀번호 확인 입력창이 비어있으면 검증 메시지를 비웁니다.
		} else {
			setPasswordConfirmValid(
				password === value
					? { message: "비밀번호가 일치합니다", color: "blue" }
					: { message: "비밀번호가 일치하지 않습니다", color: "red" }
			);
		}
	};

	const handleNicknameBlur = () => {
		if (!nicknameChecked) {
			alert("닉네임 중복확인을 해주시기 바랍니다");
		}
	};

	const signUpHandler = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// 실제 회원가입 처리 로직
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ nickname, password, passwordConfirm }),
		};

		fetch("/api/signup", options)
			.then((res) => res.json())
			.then((data) => {
				setMessage(data.message);
				console.log(data);
				router.push("/login"); // 회원가입 성공 후 로그인 페이지로 이동
			})
			.catch((error) => {
				alert("회원가입 처리 중 오류가 발생했습니다");
				setMessage("가입에 실패했습니다");
				console.error("SignUp Error", error);
			});
	};

	return (
		<div className="w-full h-screen flex flex-col justify-center items-center ">
			<div className="w-[500px] h-[80px] bg-red-500 flex justify-center items-center rounded-tl-md rounded-tr-md ">
				슈퍼소히
			</div>
			<form
				onSubmit={signUpHandler}
				className="w-[500px] h-[300px] bg-red-200 flex flex-col justify-center items-center"
			>
				<div className="w-[500px] h-[60px] flex flex-col justify-center items-center p-8 rounded-bl-md rounded-br-md">
					<div className="w-[400px] flex justify-center items-center mt-5 relative">
						<input
							className="pl-3 pr-20 w-[400px] focus:outline-none focus:border-transparent rounded-md"
							name="nickname"
							value={nickname}
							onChange={handleNicknameChange}
							onBlur={handleNicknameBlur}
							placeholder="닉네임"
						/>
						<button
							className="absolute right-0 top-0 h-full px-3 bg-red-500 rounded-md"
							type="button"
							onClick={nicknameHandler}
						>
							중복확인
						</button>
					</div>
					<div
						className="w-[400px] "
						style={{ fontSize: "10px", color: nicknameMessage.color }}
					>
						{nicknameMessage.message}
					</div>
				</div>
				<div className="w-[500px] h-[60px] bg-red-200 flex flex-col justify-center items-center p-8">
					<div className="relative w-[400px] flex justify-center items-center mt-5">
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

				<div className="w-[500px] h-[60px] bg-red-200 flex flex-col justify-center items-center p-8">
					<div className="relative w-[400px] flex justify-center items-center mt-5">
						<input
							className="pl-3 pr-10 w-full focus:outline-none focus:border-transparent rounded-md"
							type={showPasswordConfirm ? "text" : "password"}
							name="passwordConfirm"
							onChange={handlePasswordConfirmChange}
							placeholder="비밀번호 확인"
						/>
						<button
							onClick={togglePasswordConfirmVisibility}
							className="absolute right-0 top-0 bottom-0 px-3 flex items-center"
							aria-label="passwordConfirm visibility"
							type="button"
						>
							<EyeIcon visible={showPasswordConfirm} size="24" color="black" />
						</button>
					</div>
					<div
						className="w-[400px]"
						style={{ fontSize: "10px", color: passwordConfirmValid.color }}
					>
						{passwordConfirmValid.message}
					</div>
				</div>

				<div className="w-[600px] h-[50px] flex flex-col justify-center items-center mt-2">
					<button
						className={`w-[250px] h-[40px] flex justify-center items-center rounded-md ${
							formValid ? "bg-red-500" : "bg-gray-300"
						}`}
						disabled={!formValid}
					>
						가입하기
					</button>
				</div>
				<div
					className="text-blue-500 hover:text-blue-700 cursor-pointer mt-4"
					style={{ fontSize: "10px" }}
				>
					<Link href="/login">이미 아이디가 있습니다</Link>
				</div>
			</form>
		</div>
	);
};

export default SignUp;
