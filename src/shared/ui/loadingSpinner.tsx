"use client";
import React from "react";
import { useLoading } from "@/context/LoadingContext";

const LoadingSpinner: React.FC = () => {
	const { isLoading } = useLoading();
	if (!isLoading) return null;

	return (
		<div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(23,21,26,.55)]">
			<div className="h-14 w-14 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
		</div>
	);
};

export default LoadingSpinner;
