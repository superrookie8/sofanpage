"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {}

const Login: React.FC = () => {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const LoginHandler = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const nickname = form.nickname.value;
		const password = form.nickname.value;

		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ nickname, password }),
		};

		fetch("/api/", options)
			.then((res) => res.json())
			.then((data) => {
				setMessage(data.msg);
			})
			.catch((error) => {
				// alert("로그인중 오류가 발생했습니다");
				setMessage(error.msg);
			});
	};
	return (
		<div className="w-full h-screen flex flex-col justify-center items-center">
			<div className="w-[600px] h-[80px] bg-red-500 flex justify-center items-center">
				슈퍼소히
			</div>
			<form
				onSubmit={LoginHandler}
				className="w-[600px] h-[230px] bg-red-500 flex flex-col justify-center items-center"
			>
				<div className="w-[600px] h-[80px] bg-gray-300 flex items-center p-8">
					<div className="w-[100px] h-[80px] flex justify-end items-center">
						닉네임
					</div>
					<div className="w-[400px] h-[80px] flex flex-col justify-center items-center">
						<input className="w-[400px] ml-8" name="nickname"></input>
						<div className="w-auto h-[20px]">{message}</div>
					</div>
				</div>
				<div className="w-[600px] h-[80px] bg-yellow-300 flex items-center p-8">
					<div className="w-[100px] h-[80px] flex justify-end items-center">
						비밀번호
					</div>
					<div className="w-[400px] h-[80px] flex flex-col justify-center items-center">
						<input
							className="w-[400px] ml-8"
							type="password"
							name="password"
						></input>
						<div className="w-auto h-[20px]">{message}</div>
					</div>
				</div>
				<div className="w-[600px] h-[50px]  flex justify-center items-center mt-4">
					<button className="w-[250px] h-[50px] bg-green-200 flex justify-center items-center">
						로그인하기
					</button>
					<button
						onClick={() => {
							router.push("/signup");
						}}
						className="w-[250px] h-[50px] bg-green-200 flex justify-center items-center"
					>
						회원가입하기
					</button>
				</div>
			</form>
		</div>
	);
};

export default Login;
