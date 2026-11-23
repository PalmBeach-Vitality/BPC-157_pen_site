import { defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "klowpens",
		compatibilityDate: "2026-11-18",
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
		domains: ["klowpens.com", "www.klowpens.com"],
		workersDev: true,
	},
});
