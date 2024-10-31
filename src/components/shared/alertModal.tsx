import React from "react";

interface ModalProps {
	isOpen: boolean;
	message: string;
	onClose: () => void;
	buttonText?: string; // 버튼 텍스트를 prop으로 받음
	onConfirm?: () => void; // onConfirm prop 추가
}

const AlertModal: React.FC<ModalProps> = ({
	isOpen,
	message,
	onClose,
	buttonText = "닫기",
	onConfirm,
}) => {
	if (!isOpen) return null; // 모달이 열리지 않으면 렌더링 안 함

	return (
		<div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-lg shadow-lg w-80">
				<p>{message}</p>
				<div className="mt-4 flex justify-end">
					<button
						onClick={onConfirm || onClose} // onConfirm이 있으면 사용, 없으면 onClose 사용
						className="px-4 py-2 bg-blue-500 text-white rounded-lg"
					>
						{buttonText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AlertModal;
