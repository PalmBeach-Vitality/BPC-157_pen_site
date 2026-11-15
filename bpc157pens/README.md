# bpc157pens.com

Research education site about BPC-157 pens and vials. It links to BPC-157 products on palmbeach-vitality.store and is built to be read by both search engines and AI answer engines. This site is the template for the other compound sites.

The site is plain static HTML and CSS built with Vite and deployed to Cloudflare Workers static assets with the `cf` CLI.

## Run locally

Requires Node.js 22.18 or later.

```bash
npm install
npm run dev
```

The dev server runs at http://127.0.0.1:4917/.

## Build and deploy

```bash
npm run build        # type-check and build to .cloudflare/output/
npx cf deploy        # deploy to Cloudflare (requires `cf auth login`)
```

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The full guide, including JSON-LD structured data (Article, FAQPage, Organization) |
| `404.html` | Not-found page |
| `src/style.css` | All styling |
| `src/main.ts` | The dismissible 18+ notice (the only script; content never depends on it) |
| `public/index.md` | Markdown copy of the guide for AI crawlers |
| `public/llms.txt` | Summary and key facts for AI crawlers |
| `public/robots.txt` | Allows search and AI crawlers |
| `public/sitemap.xml` | Sitemap |
| `public/_headers` | Response headers |
| `public/img/` | Product photos |
| `cloudflare.config.ts` | Cloudflare Worker settings |

## Editorial rules

- Every factual claim cites a study, a regulator page, or the seller's product specifications.
- No dosing, usage, or medical guidance, and no health or healing claims.
- Study authors are credited in citations only; the site's byline is the bpc157pens.com Editorial Team.
- Ownership disclosure appears near the top, beside the product cards, and in the footer.
- When content changes, update the review date in `index.html` (byline, `dateModified`, `article:modified_time`), `public/index.md`, `public/llms.txt`, and `public/sitemap.xml`.
- Product links carry `utm_source=bpc157pens&utm_medium=referral&utm_campaign=home` plus a `utm_content` value naming the link.
