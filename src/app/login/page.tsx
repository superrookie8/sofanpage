"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSafeCallbackUrl } from "@/features/auth/safeCallbackUrl";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
	OAuthSignin: "Google 로그인을 시작하지 못했습니다.",
	OAuthCallback: "Google 로그인 응답을 확인하지 못했습니다.",
	OAuthAccountNotLinked: "이미 다른 로그인 방식으로 등록된 계정입니다.",
	AccessDenied: "Google 로그인이 취소되었거나 승인되지 않았습니다.",
	Configuration: "로그인 설정을 확인하고 있습니다. 잠시 후 다시 시도해주세요.",
};

const Spinner = () => (
	<svg
		aria-hidden="true"
		className="h-5 w-5 animate-spin"
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
		/>
		<path
			className="opacity-75"
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"
		/>
	</svg>
);

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
	const authError = searchParams.get("error");

	useEffect(() => {
		if (status === "authenticated" && session) {
			router.replace(callbackUrl);
		}
	}, [callbackUrl, router, session, status]);

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		try {
			await signIn("google", { callbackUrl });
		} catch {
			setIsLoading(false);
		}
	};

	return (
		<main className="flex min-h-[calc(100vh-72px)] w-full items-center justify-center p-4">
			<section className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
				<div className="bg-red-500 px-6 py-5 text-center text-xl font-bold text-white">
					SUPER SOHEE
				</div>
				<div className="flex flex-col items-center gap-6 px-6 py-10">
					<div className="text-center">
						<h1 className="text-xl font-semibold text-gray-900">소셜 로그인</h1>
					</div>

					{authError && (
						<p role="alert" className="text-center text-sm text-red-600">
							{AUTH_ERROR_MESSAGES[authError] ||
								"로그인을 완료하지 못했습니다. 다시 시도해주세요."}
						</p>
					)}

					<div className="w-full max-w-sm space-y-3">
						<button
							type="button"
							onClick={handleGoogleLogin}
							disabled={isLoading || status === "loading"}
							className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isLoading ? (
								<Spinner />
							) : (
								<svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
									<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
									<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
									<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
									<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
								</svg>
							)}
							<span>{isLoading ? "Google로 이동 중..." : "Google로 로그인"}</span>
						</button>

						<button
							type="button"
							disabled
							aria-disabled="true"
							className="flex h-12 w-full cursor-not-allowed items-center justify-between rounded-lg bg-[#03C75A] px-4 text-sm font-medium text-white opacity-60"
						>
							<span aria-hidden="true" className="text-lg font-black">N</span>
							<span>네이버로 로그인</span>
							<span className="rounded-full bg-white/25 px-2 py-1 text-xs">준비 중</span>
						</button>

						<button
							type="button"
							disabled
							aria-disabled="true"
							className="flex h-12 w-full cursor-not-allowed items-center justify-between rounded-lg bg-[#FEE500] px-4 text-sm font-medium text-[#191919] opacity-60"
						>
							<span aria-hidden="true" className="text-lg">●</span>
							<span>카카오로 로그인</span>
							<span className="rounded-full bg-black/10 px-2 py-1 text-xs">준비 중</span>
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}
