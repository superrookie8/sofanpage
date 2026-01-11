// useAuth 훅 수정
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useAuth = () => {
	const router = useRouter();
	const { data: session, status } = useSession();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	return session?.user || null;
};

export default useAuth;
