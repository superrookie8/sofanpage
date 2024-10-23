"use client";
import React from "react";

interface LoadingSpinnerProps {
	size?: number;
	fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = 64,
	fullScreen = false,
}) => {
	const spinnerClass = `animate-spin rounded-full border-t-4 border-red-500`;
	const spinnerStyle = { width: `${size}px`, height: `${size}px` };

	if (fullScreen) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
				<div className={spinnerClass} style={spinnerStyle}></div>
			</div>
		);
	}

	return <div className={spinnerClass} style={spinnerStyle}></div>;
};

export default LoadingSpinner;
