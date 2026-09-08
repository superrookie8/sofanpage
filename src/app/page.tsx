import HomePage from "@/features/home/components/homePage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/");
export default function Page() {
	return <HomePage />;
}
