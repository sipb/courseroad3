import { defineConfig } from "@solidjs/start/config";
import devtools from "solid-devtools/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	vite: {
		plugins: [
			tsconfigPaths({ root: "./" }),
			devtools({
				autoname: true,
				locator: {
					targetIDE: "vscode",
					componentLocation: true,
					jsxLocation: true,
				},
			}),
		],
	},
	server: { compatibilityDate: "2024-12-30" },
});
