"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
	const router = useRouter();

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get("token");

		if (token) {
			// 토큰 저장
			sessionStorage.setItem("token", token);

			// 사용자 정보 조회
			fetch(`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/users/me`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
				.then((res) => {
					if (res.status === 401) {
						sessionStorage.removeItem("token");
						router.push("/login");
						return;
					}
					return res.json();
				})
				.then((user) => {
					if (user) {
						sessionStorage.setItem("user", JSON.stringify(user));
						router.push("/home");
					}
				})
				.catch((error) => {
					console.error("사용자 정보 조회 실패:", error);
					router.push("/login");
				});
		} else {
			// 토큰이 없으면 로그인 실패
			alert("로그인에 실패했습니다");
			router.push("/login");
		}
	}, [router]);

	return (
		<div className="w-full h-screen flex justify-center items-center">
			<div className="text-center">
				<p>로그인 처리 중...</p>
			</div>
		</div>
	);
}
