// src/types/react-unity-webgl.d.ts
declare module "react-unity-webgl" {
	import React, { CSSProperties } from "react";

	export interface UnityContextOptions {
		loaderUrl: string;
		dataUrl: string;
		frameworkUrl: string;
		codeUrl: string;
		streamingAssetsUrl?: string;
		companyName?: string;
		productName?: string;
		productVersion?: string;
	}

	export interface UnityContext {
		unityProvider: any;
		loadingProgression: number;
		isLoaded: boolean;
		sendMessage: (
			gameObjectName: string,
			methodName: string,
			value?: string | number
		) => void;
		addEventListener: (
			eventName: string,
			callback: (...args: any[]) => void
		) => void;
		removeEventListener: (
			eventName: string,
			callback: (...args: any[]) => void
		) => void;
	}

	export interface UnityProps {
		unityProvider: any;
		style?: CSSProperties;
		className?: string;
		tabIndex?: number;
	}

	export function useUnityContext(options: UnityContextOptions): UnityContext;

	export const Unity: React.FC<UnityProps>;
}
