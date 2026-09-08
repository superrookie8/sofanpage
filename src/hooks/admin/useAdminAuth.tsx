"use client";

import { useEffect, useState } from "react";

const useAdminAuth = () => {
	const [authenticated, setAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		let active = true;
		fetch("/api/admin/session", { cache: "no-store" }).then((response) => {
			if (!active) return;
			if (!response.ok) {
				setAuthenticated(false);
				return;
			}
			setAuthenticated(true);
		}).catch(() => {
			if (active) setAuthenticated(false);
		});
		return () => { active = false; };
	}, []);

	return authenticated;
};

export default useAdminAuth;
