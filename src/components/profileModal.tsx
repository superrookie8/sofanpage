import React, { useState, useEffect } from "react";

interface ProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (profile: { description?: string; photo?: File | null }) => Promise<void>;
	profile: { nickname: string; description: string; photoUrl: string };
}

const ProfileModal: React.FC<ProfileModalProps> = ({
	isOpen,
	onClose,
	onSave,
	profile,
}) => {
	const [description, setDescription] = useState(profile.description);
	const [photo, setPhoto] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		setDescription(profile.description);
	}, [profile]);

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await onSave({ description, photo });
			setIsSuccess(true);
			setTimeout(() => {
				setIsSuccess(false);
				onClose();
			}, 2000); // 2초 후에 성공 메시지 모달 닫기
		} catch (error) {
			console.error("Failed to save profile:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50">
			<div className="bg-white p-6 rounded shadow-lg w-96 mt-8 relative">
				{isSuccess && (
					<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
						<div className="text-center">
							<h2 className="text-2xl mb-4">Success</h2>
							<p>프로필이 성공적으로 업데이트 되었습니다!</p>
						</div>
					</div>
				)}
				<h2 className="text-2xl mb-4">Edit Profile</h2>
				<label className="block mb-2">
					<span className="text-gray-700">Nickname</span>
					<input
						type="text"
						className="mt-1 block w-full bg-gray-100 cursor-not-allowed"
						value={profile.nickname}
						disabled
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
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-300 rounded hover:text-white"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-red-500 text-white rounded hover:text-black flex items-center"
					>
						{isLoading ? (
							<svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						) : (
							"Save"
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProfileModal;
