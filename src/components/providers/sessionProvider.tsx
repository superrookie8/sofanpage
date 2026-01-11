// src/components/providers/sessionProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "@/lib/react-query/queryClient";

export default function Providers({
	children,
	session,
}: {
	children: ReactNode;
	session: any;
}) {
	return (
		<SessionProvider session={session}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</SessionProvider>
	);
}
