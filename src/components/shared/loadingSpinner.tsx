"use client";
import React from "react";
import { useLoading } from "@/context/LoadingContext";

const LoadingSpinner: React.FC = () => {
	const { isLoading } = useLoading();
	if (!isLoading) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
		</div>
	);
};

export default LoadingSpinner;
