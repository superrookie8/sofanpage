import React, { useEffect, useState } from "react";

interface ProfileData {
	name: string;
	team: string;
	position: string;
	number: string;
	height: string;
	nickname: string;
	features: string;
}

const Profile: React.FC = () => {
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch("/api/getprofile", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				const data = await response.json();
				if (response.ok) {
					setProfile(data);
				} else {
					setError(data.message || "Failed to load profile.");
				}
			} catch (error) {
				console.error("Error fetching profile:", error);
				setError("An error occurred while fetching the profile.");
			}
		};

		fetchProfile();
	}, []);

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!profile) {
		return <div>Loading...</div>;
	}

	return (
		<div className="p-4 w-[500px]">
			<p className="ml-8 mt-4 text-gray-500">Name : {profile.name}</p>
			<p className="ml-8 mt-4 text-gray-500">Team : {profile.team}</p>
			<p className="ml-8 mt-4 text-gray-500">Position : {profile.position}</p>
			<p className="ml-8 mt-4 text-gray-500">Number : {profile.number}</p>
			<p className="ml-8 mt-4 text-gray-500">Height : {profile.height}</p>
			<p className="ml-8 mt-4 text-gray-500">Nickname : {profile.nickname}</p>
			<p className="ml-8 mt-4 text-gray-500">Features : {profile.features}</p>
		</div>
	);
};

export default Profile;
