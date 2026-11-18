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
		// www stays attached so the hostname resolves. A zone Single Redirect
		// (http_request_dynamic_redirect, ruleset 960e54cace3d4f5487b2897f69f66e2c)
		// 301s www.bpc157pens.com to the same path on https://bpc157pens.com.
		domains: ["bpc157pens.com", "www.bpc157pens.com"],
		workersDev: true,
	},
});
