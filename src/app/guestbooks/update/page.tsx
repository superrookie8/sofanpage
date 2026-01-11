"use client";
import useAuth from "@/features/auth/hooks/useAuth";
import React from "react";

interface Props {}

const Update: React.FC<Props> = (props) => {
	useAuth();
	return <div></div>;
};

export default Update;
