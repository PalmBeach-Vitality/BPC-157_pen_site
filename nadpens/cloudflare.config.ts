import { bindings, defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "nadpens",
		compatibilityDate: "2026-11-25",
		entrypoint: "./src/worker.ts",
		observability: {
			enabled: true,
			traces: {
				enabled: true,
			},
		},
		env: {
			ASSETS: bindings.assets(),
		},
		assets: {
			htmlHandling: "auto-trailing-slash",
			notFoundHandling: "404-page",
			// The zone Single Redirect API returns 403 for this token.
			// The worker runs first so www can 301 before the asset is served.
			runWorkerFirst: true,
		},
		// Both hostnames stay attached. www is redirected by src/worker.ts.
		domains: ["nadpens.com", "www.nadpens.com"],
		workersDev: true,
	},
});
