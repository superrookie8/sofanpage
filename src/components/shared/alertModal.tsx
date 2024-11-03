import React from "react";
import ReactDOM from "react-dom";

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

	return ReactDOM.createPortal(
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-[90%] mx-4">
				<p className="text-center mb-6">{message}</p>
				<div className="flex justify-center gap-4">
					{onConfirm ? (
						<>
							<button
								onClick={onConfirm}
								className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
							>
								{buttonText || "확인"}
							</button>
							<button
								onClick={onClose}
								className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
							>
								취소
							</button>
						</>
					) : (
						<button
							onClick={onClose}
							className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
						>
							{buttonText || "확인"}
						</button>
					)}
				</div>
			</div>
		</div>,
		document.body
	);
};

export default AlertModal;
