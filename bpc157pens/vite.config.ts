import { cloudflare } from "@cloudflare/vite-plugin";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [cloudflare()],
	server: {
		port: 4917,
		host: "127.0.0.1",
	},
	build: {
		rollupOptions: {
			input: {
				main: resolve(import.meta.dirname, "index.html"),
				notFound: resolve(import.meta.dirname, "404.html"),
			},
		},
	},
});
