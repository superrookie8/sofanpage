"use client";

import React from "react";

interface ExistingDiaryDialogProps {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export const ExistingDiaryDialog: React.FC<ExistingDiaryDialogProps> = ({
	open,
	onConfirm,
	onCancel,
}) => {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
				<p className="text-gray-800 text-center leading-relaxed">
					이미 일지가 있습니다.
					<br />
					수정하겠습니까?
				</p>
				<div className="mt-6 flex gap-3 justify-center">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
					>
						아니오
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
					>
						수정하기
					</button>
				</div>
			</div>
		</div>
	);
};
