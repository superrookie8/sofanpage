"use client";
import Image from "next/image";
import { useProfileQuery } from "@/features/profile/queries";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import Chip from "@/shared/ui/primitives/chip";

const HERO_IMAGE = "/images/2026-27_profile.JPG";

function MetaChips({ profile }: { profile: { team: string; position: string; height: string; jerseyNumber: number } }) {
	return (
		<div className="mt-3 flex flex-wrap gap-1.5">
			<Chip>{profile.team}</Chip>
			<Chip>{profile.position}</Chip>
			<Chip>{profile.height}</Chip>
			<Chip className="bg-ink-900 font-display text-white border-ink-900">
				#{profile.jerseyNumber}
			</Chip>
		</div>
	);
}

/**
 * 모바일: 풀블리드 사진 + 하단 ink-50 수렴 그라디언트 + 좌하단 이름 블록.
 * 데스크톱: 좌 사진 카드 / 우 이름·등번호 2컬럼.
 */
export default function Hero() {
	const { data: profile, isLoading } = useProfileQuery();

	if (isLoading || !profile) {
		return (
			<>
				<Skeleton className="-mx-4 h-[470px] rounded-none lg:hidden" />
				<Skeleton className="hidden h-[560px] rounded-lg lg:block" />
			</>
		);
	}

	const meta = {
		team: profile.team,
		position: profile.position,
		height: profile.height,
		jerseyNumber: profile.jerseyNumber || 6,
	};

	return (
		<>
			{/* 모바일 */}
			<section className="relative -mx-4 -mt-6 h-[470px] overflow-hidden lg:hidden">
				<Image
					src={HERO_IMAGE}
					alt={`${profile.name} 선수`}
					fill
					priority
					sizes="100vw"
					className="object-cover"
					style={{ objectPosition: "center 20%" }}
				/>
				<span
					aria-hidden
					className="absolute right-4 top-4 font-display text-[88px] leading-none text-[rgba(225,29,51,.85)]"
				>
					{meta.jerseyNumber}
				</span>
				<div className="absolute inset-x-0 bottom-0 h-[190px] bg-gradient-to-b from-transparent to-ink-50" />
				<div className="absolute inset-x-4 bottom-4">
					<p className="font-display text-[15px] tracking-[.08em] text-brand-500">
						LEE SOHEE
					</p>
					<h1 className="text-[34px] font-extrabold leading-tight text-ink-900">
						{profile.name}
					</h1>
					<MetaChips profile={meta} />
				</div>
			</section>

			{/* 데스크톱 */}
			<section className="hidden gap-8 lg:grid lg:grid-cols-[460px_1fr]">
				<div className="relative min-h-[560px] overflow-hidden rounded-lg">
					<Image
						src={HERO_IMAGE}
						alt={`${profile.name} 선수`}
						fill
						priority
						sizes="460px"
						className="object-cover"
						style={{ objectPosition: "center 20%" }}
					/>
					<div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[rgba(23,21,26,.85)]" />
					<p className="absolute bottom-5 left-6 font-display text-[20px] tracking-[.08em] text-white">
						LEE SOHEE <span className="text-brand-400">#{meta.jerseyNumber}</span>
					</p>
				</div>

				<div className="flex flex-col justify-center">
					<div className="flex items-start justify-between gap-6">
						<div>
							<p className="font-display text-[18px] tracking-[.1em] text-brand-500">
								LEE SOHEE
							</p>
							<h1 className="text-display-lg text-ink-900">{profile.name}</h1>
							<MetaChips profile={meta} />
						</div>
						<span
							aria-hidden
							className="font-display text-[120px] leading-none text-brand-500/90"
						>
							{meta.jerseyNumber}
						</span>
					</div>
					{profile.features && (
						<p className="mt-6 max-w-[46ch] text-body-lg text-ink-700">
							{profile.features}
						</p>
					)}
				</div>
			</section>
		</>
	);
}
