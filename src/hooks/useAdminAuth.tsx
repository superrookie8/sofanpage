"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const useAdminAuth = () => {
	const router = useRouter();
	const [authenticated, setAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		let active = true;
		fetch("/api/admin/session", { cache: "no-store" }).then((response) => {
			if (!active) return;
			if (!response.ok) {
				setAuthenticated(false);
				router.replace("/admin/login");
				return;
			}
			setAuthenticated(true);
		}).catch(() => {
			if (active) router.replace("/admin/login");
		});
		return () => { active = false; };
	}, [router]);

	return authenticated;
};

export default useAdminAuth;
