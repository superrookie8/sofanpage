// components/UserProfileModal.tsx
import React from "react";
import Image from "next/image";

interface UserProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	profile: {
		nickname: string;
		description: string;
		photoUrl?: string;
	};
	userStats: {
		win_percentage: number;
		sunny_percentage: number;
		home_win_percentage: number;
		away_win_percentage: number;
		attendance_percentage: number;
	};
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
	isOpen,
	onClose,
	profile,
	userStats,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white p-4 rounded-lg shadow-lg w-[400px]">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">User Profile</h2>
					<button onClick={onClose} className="text-red-500">
						X
					</button>
				</div>
				<div className="flex flex-col items-center">
					<div className="relative w-24 h-24 rounded-full mb-4">
						<Image
							src={profile.photoUrl || "/images/ci_2023_default.png"}
							alt="Profile"
							fill
							className="rounded-full"
							style={{ objectFit: "cover" }}
						/>
					</div>
					<h3 className="text-lg">@{profile.nickname}</h3>
					<p className="text-sm text-gray-500 mb-4">{profile.description}</p>
					<div className="flex flex-col items-start w-full text-sm">
						<span>농구마니아지수: {userStats.attendance_percentage}%</span>
						<span>날씨요정지수: {userStats.sunny_percentage}%</span>
						<span>직관승요지수: {userStats.win_percentage}%</span>
						<span>홈경기지수: {userStats.home_win_percentage}%</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfileModal;
