import useAuth from "@/hooks/useAuth";
import React from "react";

interface Props {}

const Update: React.FC<Props> = (props) => {
	useAuth();
	return <div></div>;
};

export default Update;
