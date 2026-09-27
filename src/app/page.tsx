import HomePage from "@/features/home/components/homePage";
import { pageMetadata } from "@/lib/seo";
import { getProfileForHero } from "@/features/profile/server";

export const metadata = pageMetadata("/");
export default async function Page() {
	const initialProfile = await getProfileForHero();
	return <HomePage initialProfile={initialProfile} />;
}
