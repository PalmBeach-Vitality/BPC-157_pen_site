import { defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "bpc157pens",
		compatibilityDate: "2026-11-13",
		observability: {
			enabled: true,
			traces: {
				enabled: true,
			},
		},
		assets: {
			htmlHandling: "auto-trailing-slash",
			notFoundHandling: "404-page",
		},
		workersDev: true,
	},
});
