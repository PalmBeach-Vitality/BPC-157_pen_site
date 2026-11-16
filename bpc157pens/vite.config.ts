import { cloudflare } from "@cloudflare/vite-plugin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import TurndownService from "turndown";
import { defineConfig, type Plugin } from "vite";

const root = import.meta.dirname;

// Empty string is the homepage.
export const pages = [
	"",
	"what-is-bpc-157",
	"how-bpc-157-is-made",
	"bpc-157-pen-vs-vial",
	"bpc-157-storage",
	"bpc-157-testing-coa",
	"bpc-157-legal-status",
	"faq",
	"about",
];

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
		generateBundle: {
			order: "post",
			handler(_, bundle) {
			const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
			td.remove(["script", "style", "svg", "button"]);
			td.addRule("film", {
				filter: "video",
				replacement: (_c, node) => {
					const el = node as HTMLVideoElement;
					const label = el.getAttribute("aria-label") ?? "";
					const src = el.getAttribute("src") ?? "";
					return label ? `\n\n[Video: ${label}](https://bpc157pens.com${src})\n\n` : "";
				},
			});
			td.addRule("figureImage", {
				filter: "img",
				replacement: (_c, node) => {
					const el = node as HTMLImageElement;
					const alt = el.getAttribute("alt") ?? "";
					const src = el.getAttribute("src") ?? "";
					return alt ? `![${alt}](https://bpc157pens.com${src})` : "";
				},
			});
			const cellText = (el: Element) =>
				(el.textContent ?? "").replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
			td.addRule("table", {
				filter: "table",
				replacement: (_c, node) => {
					const table = node as HTMLTableElement;
					const caption = table.querySelector("caption");
					const rows = Array.from(table.querySelectorAll("tr")).map((tr) =>
						Array.from(tr.children).map(cellText),
					);
					if (!rows.length) return "";
					const width = Math.max(...rows.map((r) => r.length));
					const line = (r: string[]) =>
						`| ${Array.from({ length: width }, (_, i) => r[i] ?? "").join(" | ")} |`;
					const head = table.querySelector("thead") ? rows.shift()! : Array(width).fill("");
					const out = [line(head), `|${" --- |".repeat(width)}`, ...rows.map(line)];
					return `\n\n${caption ? `${cellText(caption)}\n\n` : ""}${out.join("\n")}\n\n`;
				},
			});
			td.addRule("definitionList", {
				filter: "dl",
				replacement: (_c, node) => {
					const items = Array.from((node as Element).querySelectorAll("dt")).map((dt) => {
						const dd = dt.nextElementSibling;
						return `- **${cellText(dt)}:** ${dd ? cellText(dd) : ""}`;
					});
					return `\n\n${items.join("\n")}\n\n`;
				},
			});
			td.addRule("diagram", {
				filter: (node) => node.nodeName.toLowerCase() === "svg" && node.getAttribute("role") === "img",
				replacement: (_c, node) => `\n\n*Diagram: ${(node as Element).getAttribute("aria-label") ?? ""}*\n\n`,
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
