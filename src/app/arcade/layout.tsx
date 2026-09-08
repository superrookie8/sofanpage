import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/arcade");
export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
