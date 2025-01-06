declare namespace NodeJS {
	interface ProcessEnv {
		PEOPLEAPI_ID: string;
		PEOPLEAPI_SECRET: string;
	}
}

interface ImportMetaEnv {
	readonly VITE_URL: string;
	readonly VITE_FIREROAD_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
