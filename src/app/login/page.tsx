"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSafeCallbackUrl } from "@/features/auth/safeCallbackUrl";
import { cn } from "@/shared/ui/cn";
import { CHIBI } from "@/shared/ui/chibi";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
	OAuthSignin: "로그인을 시작하지 못했습니다.",
	OAuthCallback: "로그인 응답을 확인하지 못했습니다.",
	OAuthAccountNotLinked: "이미 다른 로그인 방식으로 등록된 계정입니다.",
	AccessDenied: "로그인이 취소되었거나 승인되지 않았습니다.",
	Configuration: "로그인 설정을 확인하고 있습니다. 잠시 후 다시 시도해주세요.",
};

function Spinner() {
	return (
		<svg aria-hidden className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"
			/>
		</svg>
	);
}

function KakaoGlyph() {
	return (
		<svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 3C6.8 3 2.6 6.3 2.6 10.4c0 2.6 1.7 4.9 4.3 6.2l-1 3.7c-.1.3.3.6.6.4l4.4-2.9c.4 0 .7.1 1.1.1 5.2 0 9.4-3.3 9.4-7.5S17.2 3 12 3z" />
		</svg>
	);
}

function GoogleGlyph() {
	return (
		<svg aria-hidden className="h-[18px] w-[18px]" viewBox="0 0 24 24">
			<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
			<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
			<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
			<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
		</svg>
	);
}

/** 시안 §6 — 카카오 → 네이버 → 구글 순. 미설정 프로바이더는 "준비 중"으로 둔다. */
const PROVIDERS = [
	{
		id: "kakao",
		label: "카카오로 시작하기",
		className: "bg-kakao text-[rgba(0,0,0,.85)] hover:bg-[#F6DC00]",
		glyph: <KakaoGlyph />,
		enabled: false,
	},
	{
		id: "naver",
		label: "네이버로 시작하기",
		className: "bg-naver text-white hover:bg-[#02B351]",
		glyph: <span className="text-[17px] font-black leading-none">N</span>,
		enabled: false,
	},
	{
		id: "google",
		label: "구글로 시작하기",
		className:
			"bg-white text-ink-700 font-semibold border border-ink-200 hover:bg-ink-50",
		glyph: <GoogleGlyph />,
		enabled: true,
	},
] as const;

function LoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();
	const [pending, setPending] = useState<string | null>(null);

	const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
	const authError = searchParams.get("error");

	useEffect(() => {
		if (status === "authenticated" && session) {
			router.replace(callbackUrl);
		}
	}, [callbackUrl, router, session, status]);

	const handleSignIn = async (providerId: string) => {
		setPending(providerId);
		try {
			await signIn(providerId, { callbackUrl });
		} catch {
			setPending(null);
		}
	};

	return (
		<div className="overflow-hidden rounded-lg border border-ink-200 bg-white lg:grid lg:min-h-[560px] lg:grid-cols-[1fr_480px]">
			{/* 좌측 브랜드 비주얼 (데스크톱) */}
			<div className="relative hidden lg:block">
				<Image
					src="/images/2026-27_profile.JPG"
					alt=""
					fill
					sizes="640px"
					className="object-cover"
					style={{ objectPosition: "center 20%" }}
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/25 to-transparent" />
				<div className="absolute bottom-8 left-8">
					<p className="font-display text-[40px] leading-none text-white">
						SUPER SOHEE
					</p>
					<p className="mt-2 text-sm-lg text-ink-300">
						BNK 썸 이소희 팬페이지
					</p>
				</div>
			</div>

			{/* 폼 패널 */}
			<div className="flex flex-col justify-center px-6 py-10 lg:px-10">
				<div className="text-center lg:text-left">
					<Image
						src={CHIBI.no6}
						alt=""
						width={112}
						height={112}
						className="mx-auto h-28 w-auto lg:hidden"
					/>
					<p className="mt-3 font-display text-[22px] text-ink-900 lg:hidden">
						SUPER SOHEE
					</p>
					<h1 className="mt-4 text-h1 lg:mt-0 lg:text-h1-lg">로그인</h1>
					<p className="mt-2 text-sm-lg text-ink-500">
						소셜 계정으로 3초 만에 시작
					</p>
				</div>

				{authError && (
					<p
						role="alert"
						className="mt-4 rounded-md bg-brand-50 px-4 py-3 text-center text-[13px] font-medium text-brand-700"
					>
						{AUTH_ERROR_MESSAGES[authError] ||
							"로그인을 완료하지 못했습니다. 다시 시도해주세요."}
					</p>
				)}

				<div className="mt-6 flex flex-col gap-2.5">
					{PROVIDERS.map((provider) => {
						const loading = pending === provider.id;
						const disabled =
							!provider.enabled || loading || status === "loading";

						return (
							<button
								key={provider.id}
								type="button"
								onClick={() => provider.enabled && handleSignIn(provider.id)}
								disabled={disabled}
								aria-disabled={disabled}
								className={cn(
									"flex h-12 w-full items-center justify-center gap-2.5 rounded-md text-[15px] font-bold transition-colors",
									provider.className,
									disabled && "cursor-not-allowed opacity-60"
								)}
							>
								{loading ? <Spinner /> : provider.glyph}
								<span>{provider.label}</span>
								{!provider.enabled && (
									<span className="rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-semibold">
										준비 중
									</span>
								)}
							</button>
						);
					})}
				</div>

				<p className="mt-5 text-center text-caption text-ink-500">
					첫 로그인 시 닉네임만 정하면 끝
				</p>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginContent />
		</Suspense>
	);
}
