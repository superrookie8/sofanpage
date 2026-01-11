"use client";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const RenovationNotice: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [dontShowAgain, setDontShowAgain] = useState(false);
	const [hideForToday, setHideForToday] = useState(false);

	useEffect(() => {
		// localStorage에서 영구적으로 닫았는지 확인
		const permanentlyClosed = localStorage.getItem(
			"renovationNotice2025_permanent"
		);

		// 오늘 하루만 닫았는지 확인
		const hideUntilDate = localStorage.getItem(
			"renovationNotice2025_hideUntil"
		);
		if (hideUntilDate) {
			const hideUntil = new Date(hideUntilDate);
			const now = new Date();
			// 오늘 날짜가 지났으면 다시 표시
			if (now > hideUntil) {
				localStorage.removeItem("renovationNotice2025_hideUntil");
			} else {
				// 아직 하루가 지나지 않았으면 표시 안 함
				return;
			}
		}

		// 영구적으로 닫지 않았다면 표시
		if (!permanentlyClosed) {
			setIsOpen(true);
		}
	}, []);

	const handleClose = () => {
		setIsOpen(false);

		if (dontShowAgain) {
			// 영구적으로 닫기
			localStorage.setItem("renovationNotice2025_permanent", "true");
		} else if (hideForToday) {
			// 오늘 하루만 닫기 (내일 00:00까지)
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(0, 0, 0, 0);
			localStorage.setItem(
				"renovationNotice2025_hideUntil",
				tomorrow.toISOString()
			);
		}
		// 체크박스 없이 닫으면 다음 접속 시 다시 표시됨
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

					{/* 체크박스 옵션 */}
					<div className="mt-4 flex justify-center gap-6">
						<label className="flex items-center cursor-pointer text-sm text-gray-700">
							<input
								type="checkbox"
								checked={hideForToday}
								onChange={(e) => {
									setHideForToday(e.target.checked);
									if (e.target.checked) {
										setDontShowAgain(false);
									}
								}}
								className="mr-2 w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
							/>
							<span>하루만 끄기</span>
						</label>
						<label className="flex items-center cursor-pointer text-sm text-gray-700">
							<input
								type="checkbox"
								checked={dontShowAgain}
								onChange={(e) => {
									setDontShowAgain(e.target.checked);
									if (e.target.checked) {
										setHideForToday(false);
									}
								}}
								className="mr-2 w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
							/>
							<span>이 창 더 이상 보지 않기</span>
						</label>
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
