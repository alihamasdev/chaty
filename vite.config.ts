import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3000,
		host: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
	plugins: [tailwindcss(), react()],
	build: {
		chunkSizeWarningLimit: 600,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules/firebase")) {
						return "firebase";
					}
					if (id.includes("node_modules/motion")) {
						return "motion";
					}
					if (
						id.includes("node_modules/react") ||
						id.includes("node_modules/react-dom") ||
						id.includes("node_modules/linkify-react") ||
						id.includes("node_modules/cn")
					) {
						return "vendor";
					}
				},
			},
		},
	},
});
