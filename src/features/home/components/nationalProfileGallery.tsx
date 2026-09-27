"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const PHOTOS = [
	{ id: 2, label: "국가대표 유니폼 전신" },
	{ id: 1, label: "국가대표 트레이닝복 정면" },
	{ id: 3, label: "국가대표 트레이닝복 측면" },
	{ id: 4, label: "농구공과 함께한 국가대표 프로필" },
	{ id: 5, label: "국가대표 유니폼 클로즈업" },
];

const photoSrc = (id: number) => `/images/national-team/profile-${id}.webp`;
const controlClass = "min-h-11 rounded-full border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function NationalProfileGallery() {
	const [activeIndex, setActiveIndex] = useState(0);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const active = PHOTOS[activeIndex];

	useEffect(() => {
		if (!isOpen) return;
		dialogRef.current?.showModal();
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => { document.body.style.overflow = previousOverflow; };
	}, [isOpen]);

	function move(direction: number) {
		setActiveIndex((index) => (index + direction + PHOTOS.length) % PHOTOS.length);
	}

	function openPhoto(index: number) {
		setActiveIndex(index);
		setIsOpen(true);
	}

	return (
		<section aria-labelledby="national-profile-heading" className="rounded-lg border border-ink-200 bg-white p-4 sm:p-6">
			<div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
				<h3 id="national-profile-heading" className="text-lg font-bold text-ink-900">국가대표 프로필</h3>
				<p className="text-sm text-ink-500">사진을 누르면 크게 볼 수 있어요.</p>
			</div>
			<div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
				{PHOTOS.map((photo, index) => (
					<button
						key={photo.id}
						type="button"
						aria-label={`${photo.label} 사진 크게 보기`}
						onClick={() => openPhoto(index)}
						className="group relative aspect-[2/3] overflow-hidden rounded-md bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
					>
						<Image src={photoSrc(photo.id)} alt={`이소희 ${photo.label}`} fill sizes="(max-width: 639px) 30vw, (max-width: 1023px) 18vw, 210px" className="object-contain transition-opacity group-hover:opacity-85" />
					</button>
				))}
			</div>
			<dialog
				ref={dialogRef}
				aria-labelledby="national-photo-title"
				onClose={() => setIsOpen(false)}
				onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
				onKeyDown={(event) => {
					if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
						event.preventDefault();
						move(event.key === "ArrowLeft" ? -1 : 1);
					}
				}}
				className="m-auto max-h-[100dvh] w-full max-w-5xl border-0 bg-transparent p-3 text-white backdrop:bg-black/90 sm:p-6"
			>
				{isOpen && (
					<div className="rounded-lg bg-ink-900 p-3 sm:p-4">
						<div className="mb-3 flex items-center justify-between gap-3">
							<p id="national-photo-title" aria-live="polite" className="text-sm">{active.label} · {activeIndex + 1} / {PHOTOS.length}</p>
							<button type="button" autoFocus onClick={() => dialogRef.current?.close()} className={controlClass}>닫기</button>
						</div>
						<div className="relative h-[calc(100dvh-200px)] min-h-32">
							<Image src={photoSrc(active.id)} alt={`이소희 ${active.label}`} fill sizes="(max-width: 639px) 95vw, 800px" className="object-contain" />
						</div>
						<div className="mt-3 flex justify-between gap-3">
							<button type="button" onClick={() => move(-1)} className={controlClass}>← 이전 사진</button>
							<button type="button" onClick={() => move(1)} className={controlClass}>다음 사진 →</button>
						</div>
					</div>
				)}
			</dialog>
		</section>
	);
}
