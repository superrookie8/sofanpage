declare global {
	interface UnityInstanceParams {
		dataUrl: string;
		frameworkUrl: string;
		codeUrl: string;
		streamingAssetsUrl: string;
		companyName: string;
		productName: string;
		productVersion: string;
	}

	interface UnityInstance {
		Quit(): Promise<void>;
	}

	interface Window {
		createUnityInstance(
			container: HTMLElement,
			params: UnityInstanceParams
		): Promise<UnityInstance>;
	}
}

export {};
