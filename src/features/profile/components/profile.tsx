"use client";
import React from "react";
import { useProfileQuery } from "../queries";

const Profile: React.FC = () => {
	const { data: profile, isLoading, error } = useProfileQuery();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	if (!profile) {
		return <div>프로필 정보를 불러올 수 없습니다</div>;
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
				Nickname :{" "}
				{Array.isArray(profile.nickname)
					? profile.nickname.join(", ")
					: profile.nickname}
			</p>
			<p className="ml-8 mt-4 text-gray-500">Features : {profile.features}</p>
		</div>
	);
};

export default Profile;
