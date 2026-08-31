"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		fetch("/api/admin/session", { cache: "no-store" }).then((response) => {
			if (response.ok) router.replace("/admin");
		});
	}, [router]);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setLoading(true);
		setMessage("");
		try {
			const response = await fetch("/api/auth/admin-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
			const data = await response.json() as { message?: string };
			if (!response.ok) {
				setMessage(data.message || "아이디와 비밀번호를 확인해 주세요.");
				return;
			}
			router.replace("/admin");
			router.refresh();
		} catch (error) {
			console.error("Login error:", error);
			setMessage("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="admin-login-page">
			<section className="admin-login-visual">
				<div className="admin-login-brand"><span>06</span><div><strong>SUPER SOHEE</strong><small>PRIVATE ADMIN OFFICE</small></div></div>
				<div className="admin-login-message"><span>BUSAN BNK SUM · NO.6</span><h1>Every shining<br />moment of <em>Sohee.</em></h1><p>이소희 선수의 빛나는 순간을 가장 가까이에서 기록하는 공간.</p></div>
				<div className="admin-login-court" aria-hidden="true"><i /><i /><i /></div>
				<div className="admin-login-signature">LEE SO HEE <strong>6</strong></div>
			</section>
			<section className="admin-login-panel">
				<form onSubmit={handleSubmit}>
					<div className="admin-login-heading"><span>WELCOME BACK</span><h2>관리자 로그인</h2><p>팬페이지 운영 계정으로 로그인해 주세요.</p></div>
					{message && <div className="admin-login-error" role="alert"><span>!</span>{message}</div>}
					<label className="admin-login-field"><span>아이디</span><div><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin ID" autoComplete="username" required /></div></label>
					<label className="admin-login-field"><span>비밀번호</span><div><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "숨김" : "보기"}</button></div></label>
					<button className="admin-login-submit" type="submit" disabled={loading}>{loading ? <><i /> 로그인 중...</> : <>관리자 페이지 입장 <span>→</span></>}</button>
					<p className="admin-login-note"><i /> 관리자 전용 보안 페이지입니다.</p>
				</form>
			</section>
		</main>
	);
}
