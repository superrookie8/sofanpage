"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Button from "@/shared/ui/primitives/button";
import Sheet from "@/shared/ui/primitives/sheet";
import { CHIBI } from "@/shared/ui/chibi";
import {
	NICKNAME_MAX_LENGTH,
	PROFILE_IMAGE_ACCEPT,
	ProfileValidationError,
	uploadProfileImage,
	validateNickname,
	validateProfileImage,
	checkNicknameAvailable,
	type ProfileUpdate,
	type UserInfo,
} from "../api";
import { useUpdateUserInfoMutation } from "../queries";

interface ProfileEditSheetProps {
	open: boolean;
	onClose: () => void;
	user: UserInfo;
}

type NicknameCheck =
	| { state: "idle" | "checking" | "available" }
	| { state: "taken"; message: string };

function messageOf(error: unknown, fallback: string) {
	return error instanceof Error && error.message ? error.message : fallback;
}

export default function ProfileEditSheet({
	open,
	onClose,
	user,
}: ProfileEditSheetProps) {
	const [nickname, setNickname] = useState(user.nickname ?? "");
	const [photo, setPhoto] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [removePhoto, setRemovePhoto] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [check, setCheck] = useState<NicknameCheck>({ state: "idle" });
	const [saving, setSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const updateProfile = useUpdateUserInfoMutation();

	// 시트를 다시 열 때 이전 편집 내용이 남지 않도록 초기화한다.
	useEffect(() => {
		if (!open) return;
		setNickname(user.nickname ?? "");
		setPhoto(null);
		setRemovePhoto(false);
		setError(null);
		setCheck({ state: "idle" });
	}, [open, user.nickname]);

	// 미리보기 URL은 파일이 바뀌거나 화면을 떠날 때 반드시 해제한다.
	useEffect(() => {
		if (!photo) {
			setPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(photo);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [photo]);

	const trimmed = nickname.trim();
	const nicknameChanged = trimmed !== (user.nickname ?? "");

	// 입력이 멈춘 뒤에만 중복 확인을 보낸다.
	useEffect(() => {
		if (!open || !nicknameChanged) {
			setCheck({ state: "idle" });
			return;
		}
		try {
			validateNickname(trimmed);
		} catch {
			setCheck({ state: "idle" });
			return;
		}

		let active = true;
		setCheck({ state: "checking" });
		const timer = setTimeout(() => {
			checkNicknameAvailable(trimmed)
				.then((available) => {
					if (!active) return;
					setCheck(
						available
							? { state: "available" }
							: { state: "taken", message: "이미 사용 중인 닉네임이에요" }
					);
				})
				.catch(() => {
					if (active) setCheck({ state: "idle" });
				});
		}, 400);

		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, [open, trimmed, nicknameChanged]);

	const pickPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		try {
			setPhoto(validateProfileImage(file));
			setRemovePhoto(false);
			setError(null);
		} catch (validationError) {
			setError(messageOf(validationError, "이미지를 사용할 수 없어요"));
		}
	};

	const handleSave = async () => {
		if (saving) return;
		setError(null);

		const update: ProfileUpdate = {};
		try {
			if (nicknameChanged) update.nickname = validateNickname(trimmed);
		} catch (validationError) {
			setError(messageOf(validationError, "닉네임을 확인해 주세요"));
			return;
		}
		if (check.state === "taken") {
			setError(check.message);
			return;
		}

		setSaving(true);
		try {
			if (photo) {
				update.profileImageUrl = await uploadProfileImage(photo);
			} else if (removePhoto) {
				update.profileImageUrl = "";
			}

			if (Object.keys(update).length === 0) {
				onClose();
				return;
			}

			await updateProfile.mutateAsync(update);
			onClose();
		} catch (saveError) {
			setError(
				saveError instanceof ProfileValidationError
					? saveError.message
					: messageOf(saveError, "프로필을 저장하지 못했어요")
			);
		} finally {
			setSaving(false);
		}
	};

	const shownImage = removePhoto ? null : previewUrl ?? user.profileImageUrl;

	return (
		<Sheet open={open} onClose={onClose} title="프로필 수정">
			<div className="flex flex-col gap-5">
				<div className="flex items-center gap-4">
					<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-brand-100">
						{shownImage ? (
							<Image
								src={shownImage}
								alt=""
								fill
								sizes="80px"
								className="object-cover"
								unoptimized
							/>
						) : (
							<Image
								src={CHIBI.red}
								alt=""
								fill
								sizes="80px"
								className="object-contain p-1"
							/>
						)}
					</div>
					<div className="flex flex-col items-start gap-2">
						<Button
							variant="secondary"
							onClick={() => fileInputRef.current?.click()}
						>
							사진 변경
						</Button>
						{shownImage && (
							<button
								type="button"
								onClick={() => {
									setPhoto(null);
									setRemovePhoto(true);
								}}
								className="text-caption text-ink-500 underline"
							>
								기본 이미지로
							</button>
						)}
						<input
							ref={fileInputRef}
							type="file"
							accept={PROFILE_IMAGE_ACCEPT}
							onChange={pickPhoto}
							className="hidden"
							aria-label="프로필 사진 선택"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="profile-nickname"
						className="mb-1.5 block text-caption text-ink-500"
					>
						닉네임
					</label>
					<input
						id="profile-nickname"
						value={nickname}
						onChange={(event) => setNickname(event.target.value)}
						maxLength={NICKNAME_MAX_LENGTH}
						className="h-[44px] w-full rounded-md border border-ink-100 bg-white px-3 text-[15px] text-ink-900 outline-none focus:border-brand-700"
					/>
					<p
						className="mt-1.5 text-caption text-ink-500"
						role={check.state === "taken" ? "alert" : "status"}
					>
						{check.state === "checking" && "확인 중..."}
						{check.state === "available" && "사용할 수 있는 닉네임이에요"}
						{check.state === "taken" && check.message}
						{check.state === "idle" &&
							`2~${NICKNAME_MAX_LENGTH}자의 한글, 영문, 숫자, . _ - 만 쓸 수 있어요`}
					</p>
				</div>

				{error && (
					<p role="alert" className="text-caption text-brand-700">
						{error}
					</p>
				)}

				<div className="flex gap-2">
					<Button variant="secondary" fullWidth onClick={onClose}>
						취소
					</Button>
					<Button
						fullWidth
						onClick={handleSave}
						disabled={saving || check.state === "taken"}
					>
						{saving ? "저장 중..." : "저장"}
					</Button>
				</div>
			</div>
		</Sheet>
	);
}
