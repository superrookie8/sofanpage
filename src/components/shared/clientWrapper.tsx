// src/components/ClientWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import React from "react";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();

	return (
		<motion.div
			key={pathname}
			initial={{ opacity: 0, x: "100vw" }}
			animate={{
				opacity: 1,
				x: 0,
			}}
			exit={{ x: "-100vw", transition: { ease: "easeInOut" } }}
			transition={{ duration: 0.3, yoyo: Infinity }}
		>
			{children}
		</motion.div>
	);
};

export default ClientWrapper;
