import React, { useEffect, useState } from "react";

interface ProfileData {
	id: string;
	name: string;
	team: string;
	jerseyNumber: number;
	position: string;
	height: string;
	nickname: string[];
	features: string;
	profileImageUrl?: string | null;
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

				if (!response.ok) {
					const errorData = await response.json();
					setError(errorData.message || "Failed to load profile.");
					return;
				}

				const data = await response.json();
				setProfile(data);
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
			{profile.profileImageUrl && (
				<div className="flex justify-center mb-4">
					<img
						src={profile.profileImageUrl}
						alt={profile.name}
						className="w-32 h-32 rounded-full object-cover"
					/>
				</div>
			)}
			<p className="ml-8 mt-4 text-gray-500">Name : {profile.name}</p>
			<p className="ml-8 mt-4 text-gray-500">Team : {profile.team}</p>
			<p className="ml-8 mt-4 text-gray-500">Position : {profile.position}</p>
			<p className="ml-8 mt-4 text-gray-500">Number : {profile.jerseyNumber}</p>
			<p className="ml-8 mt-4 text-gray-500">Height : {profile.height}</p>
			<p className="ml-8 mt-4 text-gray-500">
				Nickname : {Array.isArray(profile.nickname) ? profile.nickname.join(", ") : profile.nickname}
			</p>
			<p className="ml-8 mt-4 text-gray-500">Features : {profile.features}</p>
		</div>
	);
};

export default Profile;
