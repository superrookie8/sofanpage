"use client";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const RenovationNotice: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// localStorage에서 팝업을 이미 닫았는지 확인
		const hasSeenNotice = localStorage.getItem("renovationNotice2025");

		// 2025년 1월 1일 이후에도 표시할지 결정 (필요시 날짜 조건 추가 가능)
		// 현재는 닫지 않았다면 항상 표시
		if (!hasSeenNotice) {
			setIsOpen(true);
		}
	}, []);

	const handleClose = () => {
		setIsOpen(false);
		// 오늘 하루만 안 보이도록 설정 (또는 영구적으로 안 보이게 하려면 주석 해제)
		localStorage.setItem("renovationNotice2025", "true");
	};

	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
			<div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-[90%] mx-4 relative">
				{/* 닫기 버튼 */}
				<button
					onClick={handleClose}
					className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
					aria-label="닫기"
				>
					&times;
				</button>

				{/* 내용 */}
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-500 mb-4">
						🎉 리뉴얼 안내
					</h2>
					<div className="space-y-3 text-gray-700">
						<p className="text-lg font-semibold">2026년 1월 1일 리뉴얼 예정</p>
						<p className="text-sm leading-relaxed">
							현재 사이트는 리뉴얼 준비 중입니다.
							<br />더 나은 서비스로 찾아뵙겠습니다!
						</p>
						<p className="text-xs text-gray-500 mt-4">
							* 백엔드 시스템 업그레이드 및 UI 개선 작업 진행 중
						</p>
					</div>
					<button
						onClick={handleClose}
						className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors"
					>
						확인했습니다
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
};

export default RenovationNotice;
