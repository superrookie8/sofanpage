"use client";

import React, { useEffect, useState } from "react";

interface ProfileData {
	name: string;
	team: string;
	position: string;
	number: string;
	nationalNumber: string;
	height: string;
	nickname: string;
	features: string;
	profileImageUrl?: string | null;
}

const ProfileForm: React.FC = () => {
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch("/api/admin/getprofile", {
					method: "GET",
					cache: "no-store",
				});

				if (!response.ok) {
					const body = await response.json().catch(() => ({}));
					throw new Error(body.message || body.error || "Failed to fetch profile data");
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const response = await fetch("/api/admin/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(profile),
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.message || body.error || "Failed to save profile data");
			}

			const data = await response.json();
			setProfile(data);
			setMessage("Profile saved successfully!");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "An error occurred while saving the profile.");
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setProfile({ ...profile, [e.target.name]: e.target.value } as ProfileData);
	};

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!profile) {
		return <div>Loading...</div>;
	}

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label>Name:</label>
				<input name="name" value={profile.name} onChange={handleChange} />
			</div>
			<div>
				<label>Team:</label>
				<input name="team" value={profile.team || ""} onChange={handleChange} />
			</div>
			<div>
				<label>Position:</label>
				<input
					name="position"
					value={profile.position}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Number:</label>
				<input type="number" min="0" max="99" name="number" value={profile.number} onChange={handleChange} />
			</div>
			<div>
				<label>National Team Number:</label>
				<input
					type="number"
					min="0"
					max="99"
					name="nationalNumber"
					value={profile.nationalNumber}
					onChange={handleChange}
					placeholder="없으면 비워두세요"
				/>
			</div>
			<div>
				<label>Height:</label>
				<input name="height" value={profile.height} onChange={handleChange} />
			</div>
			<div>
				<label>Nickname:</label>
				<input
					name="nickname"
					value={profile.nickname}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Features:</label>
				<textarea
					name="features"
					value={profile.features}
					onChange={handleChange}
				/>
			</div>
			<button type="submit">Save Profile</button>
			{message && <p>{message}</p>}
		</form>
	);
};

export default ProfileForm;
