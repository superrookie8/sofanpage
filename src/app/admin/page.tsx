"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {}

const Admin: React.FC<Props> = (props) => {
	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("admin-token");
		if (!token) {
			router.push("/admin/login");
		}
	}, [router]);
	return (
		<div>
			<h1>Admin Dashboard</h1>
			<ul>
				<li>
					<Link href="/admin/profile">Manage Profiles</Link>
				</li>
				<li>
					<Link href="/admin/stats">Manage Stats</Link>
				</li>
				<li>
					<Link href="/admin/photos">Upload Photos</Link>
				</li>
				<li>
					<Link href="/admin/deletephotos">Delete Photos</Link>
				</li>
				<li>
					<Link href="/admin/news">Manage News</Link>
				</li>
				<li>
					<Link href="/admin/schedule">Manage Schedule</Link>
				</li>
				<li>
					<Link href="/admin/guestbooks">Manage Guestbook</Link>
				</li>
			</ul>
		</div>
	);
};

export default Admin;
