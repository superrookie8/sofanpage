import { Suspense } from "react";
import NewsPage from "@/features/news/components/newsPage";
import { CardSkeletonList } from "@/shared/ui/primitives/skeleton";

export default function Page() {
  return <Suspense fallback={<CardSkeletonList count={5} />}><NewsPage /></Suspense>;
}
