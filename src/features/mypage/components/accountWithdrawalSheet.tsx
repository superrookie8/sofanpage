"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getProviders, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "@/shared/ui/primitives/button";
import Sheet from "@/shared/ui/primitives/sheet";
import {
	deleteAccount,
	clearWithdrawalAccountMarker,
	markWithdrawalAccount,
	WITHDRAWAL_CONFIRMATION,
	WithdrawalError,
} from "@/features/mypage/withdrawal";

interface AccountWithdrawalSheetProps {
	open: boolean;
	reauthenticated: boolean;
	reauthenticationIssue?: boolean;
	expectedAccountId?: string;
	accountProvider?: string | null;
	onClose: () => void;
}

export function withdrawalProviderIds(
	available: Record<string, unknown> | null,
	accountProvider?: string | null
) {
	return Object.keys(available ?? {}).filter(
		(id) => id === accountProvider && (id === "google" || id === "kakao")
	);
}

export function WithdrawalConsequences() {
	return (
		<div id="withdrawal-consequences" className="rounded-md bg-brand-50 p-4 text-sm leading-6 text-ink-700">
			<p className="font-bold text-brand-700">탈퇴 전에 확인해 주세요.</p>
			<ul className="mt-2 list-disc space-y-1 pl-5">
				<li>계정, 프로필, 계정과 연결된 직관일지, 아케이드 최고 점수와 순위가 삭제됩니다.</li>
				<li>공개 랭킹에서도 닉네임과 점수가 제거되며 복구할 수 없습니다.</li>
				<li>소유를 확인하기 어려운 기존 직관일지 사진과 과거 방명록처럼 계정과 연결할 수 없는 정보는 별도로 삭제를 요청해야 합니다.</li>
				<li>Google·Kakao 계정이나 해당 서비스에서 한 동의가 자동으로 해지되지는 않습니다.</li>
			</ul>
		</div>
	);
}

export default function AccountWithdrawalSheet({
	open,
	reauthenticated,
	reauthenticationIssue = false,
	expectedAccountId,
	accountProvider,
	onClose,
}: AccountWithdrawalSheetProps) {
	const queryClient = useQueryClient();
	const [providers, setProviders] = useState<string[]>([]);
	const [reauthenticationRejected, setReauthenticationRejected] = useState(false);
	const [loadingProviders, setLoadingProviders] = useState(false);
	const [pendingProvider, setPendingProvider] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const confirmationStage = reauthenticated && !reauthenticationRejected;

	useEffect(() => {
		if (!open || confirmationStage) return;
		let active = true;
		setLoadingProviders(true);
		getProviders()
			.then((available) => {
				if (!active) return;
				setProviders(withdrawalProviderIds(available, accountProvider));
			})
			.catch(() => active && setProviders([]))
			.finally(() => active && setLoadingProviders(false));
		return () => {
			active = false;
		};
	}, [open, confirmationStage, accountProvider]);

	useEffect(() => {
		if (!open) {
			setConfirmation("");
			setError(null);
			setSubmitting(false);
			setPendingProvider(null);
			setReauthenticationRejected(false);
		}
	}, [open]);

	useEffect(() => {
		if (open && reauthenticationIssue) {
			setError("가입에 사용한 같은 계정으로 다시 인증해 주세요.");
		}
	}, [open, reauthenticationIssue]);

	const reauthenticate = async (provider: string) => {
		if (pendingProvider) return;
		setError(null);
		setPendingProvider(provider);
		try {
			if (!expectedAccountId || !markWithdrawalAccount(sessionStorage, expectedAccountId)) {
				setError("계정 정보를 확인하지 못했습니다. 페이지를 새로고침해 주세요.");
				setPendingProvider(null);
				return;
			}
			await signIn(provider, { callbackUrl: "/mypage?withdraw=confirm" });
		} catch {
			clearWithdrawalAccountMarker(sessionStorage);
			setError("소셜 인증을 시작하지 못했습니다. 다시 시도해 주세요.");
			setPendingProvider(null);
		}
	};

	const withdraw = async () => {
		if (submitting || confirmation !== WITHDRAWAL_CONFIRMATION) return;
		setSubmitting(true);
		setError(null);
		try {
			await deleteAccount(confirmation);
			clearWithdrawalAccountMarker(sessionStorage);
			queryClient.clear();
			try {
				await signOut({ redirect: false });
			} catch {
				// 계정은 이미 삭제됐다. 로컬 로그아웃 실패가 홈 이동을 막아서는 안 된다.
			}
			window.location.replace("/home?accountDeleted=1");
		} catch (withdrawalError) {
			if (
				withdrawalError instanceof WithdrawalError &&
				(withdrawalError.status === 401 || withdrawalError.status === 412)
			) {
				setReauthenticationRejected(true);
			}
			setError(
				withdrawalError instanceof Error
					? withdrawalError.message
					: "회원 탈퇴를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
			);
			setSubmitting(false);
		}
	};

	return (
		<Sheet open={open} onClose={submitting ? () => {} : onClose} title="회원 탈퇴">
			<WithdrawalConsequences />

			{confirmationStage ? (
				<div className="mt-5">
					<label className="block text-sm font-bold text-ink-900" htmlFor="withdrawal-confirmation">
						계속하려면 ‘{WITHDRAWAL_CONFIRMATION}’를 입력해 주세요.
					</label>
					<input
						id="withdrawal-confirmation"
						autoFocus
						autoComplete="off"
						value={confirmation}
						onChange={(event) => setConfirmation(event.target.value)}
						disabled={submitting}
						aria-describedby="withdrawal-consequences"
						className="mt-2 h-12 w-full rounded-md border border-ink-200 px-3 text-[16px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
					/>
					<Button
						variant="danger"
						size="lg"
						fullWidth
						className="mt-4"
						disabled={submitting || confirmation !== WITHDRAWAL_CONFIRMATION}
						onClick={withdraw}
					>
						{submitting ? "탈퇴 처리 중" : "계정과 기록 삭제"}
					</Button>
				</div>
			) : (
				<div className="mt-5">
					<p className="text-sm font-bold text-ink-900">계정을 보호하기 위해 가입에 사용한 소셜 계정으로 다시 인증해 주세요.</p>
					<div className="mt-3 grid gap-2 sm:grid-cols-2">
						{providers.map((provider) => (
							<Button key={provider} variant="secondary" size="lg" disabled={Boolean(pendingProvider)} onClick={() => reauthenticate(provider)}>
								{pendingProvider === provider ? "인증 이동 중" : `${provider === "google" ? "Google" : "Kakao"}로 다시 인증`}
							</Button>
						))}
					</div>
					{!loadingProviders && providers.length === 0 && (
						<p className="mt-3 text-sm text-brand-700">현재 사용할 수 있는 소셜 인증을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
					)}
				</div>
			)}

			{error && <p role="alert" className="mt-4 text-sm font-semibold text-brand-700">{error}</p>}
		</Sheet>
	);
}
