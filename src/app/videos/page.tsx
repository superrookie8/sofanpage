import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { CardSkeletonList } from "@/shared/ui/primitives/skeleton";
import VideosPage from "@/features/videos/components/videosPage";

export const metadata = pageMetadata("/videos");
export default function Page() {
	return <Suspense fallback={<CardSkeletonList count={6} />}><VideosPage /></Suspense>;
}
