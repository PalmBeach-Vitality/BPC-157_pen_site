import { cloudflare } from "@cloudflare/vite-plugin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import TurndownService from "turndown";
import { defineConfig, type Plugin } from "vite";

const root = import.meta.dirname;

// Full page list returns once each page file exists. Empty string is the homepage.
export const pages = [""];

function pagePath(file: string): string {
	const rel = file.slice(root.length).replace(/\\/g, "/");
	return rel.replace(/index\.html$/, "") || "/";
}

function site(): Plugin {
	const partial = (name: string) =>
		readFileSync(resolve(root, "partials", `${name}.html`), "utf8");

	return {
		name: "bpc157pens-site",
		enforce: "pre",
		transformIndexHtml: {
			order: "pre",
			handler(html, ctx) {
				const path = pagePath(ctx.filename);
				let out = html;
				for (let i = 0; i < 3; i++) {
					out = out.replace(/<!--@include ([\w-]+)-->/g, (_, name: string) => partial(name));
				}
				return out.replace(
					new RegExp(`(<a[^>]*data-nav[^>]*href="${path}")`, "g"),
					'$1 aria-current="page"',
				);
			},
		},
		generateBundle(_, bundle) {
			const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
			td.remove(["script", "style", "svg", "button", "video"]);
			td.addRule("figureImage", {
				filter: "img",
				replacement: (_c, node) => {
					const el = node as HTMLImageElement;
					const alt = el.getAttribute("alt") ?? "";
					const src = el.getAttribute("src") ?? "";
					return alt ? `![${alt}](https://bpc157pens.com${src})` : "";
				},
			});
			td.addRule("hidden", {
				filter: (node) => (node as HTMLElement).hasAttribute?.("data-md-skip"),
				replacement: () => "",
			});
			for (const [fileName, asset] of Object.entries(bundle)) {
				if (asset.type !== "asset" || !fileName.endsWith("index.html")) continue;
				const html = String(asset.source);
				const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1];
				if (!main) continue;
				const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? "";
				const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
				const md = td
					.turndown(main)
					.replace(/\n{3,}/g, "\n\n")
					.trim();
				this.emitFile({
					type: "asset",
					fileName: fileName.replace(/index\.html$/, "index.md"),
					source: `<!-- ${title} | ${canonical} -->\n\n${md}\n`,
				});
			}
		},
	};
}

const input: Record<string, string> = { notFound: resolve(root, "404.html") };
for (const p of pages) input[p || "home"] = resolve(root, p, "index.html");

export default defineConfig({
	plugins: [site(), cloudflare()],
	server: {
		port: 4917,
		host: "127.0.0.1",
	},
	build: {
		rollupOptions: { input },
	},
});
