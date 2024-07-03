import React, { useState, useEffect } from "react";

interface ProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (profile: {
		nickname?: string;
		description?: string;
		photo?: File | null;
	}) => void;
	profile: { nickname: string; description: string; photoUrl: string };
}

const ProfileModal: React.FC<ProfileModalProps> = ({
	isOpen,
	onClose,
	onSave,
	profile,
}) => {
	const [nickname, setNickname] = useState(profile.nickname);
	const [description, setDescription] = useState(profile.description);
	const [photo, setPhoto] = useState<File | null>(null);

	useEffect(() => {
		setNickname(profile.nickname);
		setDescription(profile.description);
	}, [profile]);

	const handleSave = () => {
		onSave({ nickname, description, photo });
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white p-6 rounded shadow-lg w-96">
				<h2 className="text-2xl mb-4">Edit Profile</h2>
				<label className="block mb-2">
					<span className="text-gray-700">Nickname</span>
					<input
						type="text"
						className="mt-1 block w-full"
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
					/>
				</label>
				<label className="block mb-2">
					<span className="text-gray-700">Description</span>
					<textarea
						className="mt-1 block w-full"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</label>
				<label className="block mb-4">
					<span className="text-gray-700">Photo</span>
					<input
						type="file"
						onChange={(e) => setPhoto(e.target.files?.[0] || null)}
					/>
				</label>
				<div className="flex justify-end space-x-2">
					<button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-blue-500 text-white rounded"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProfileModal;
