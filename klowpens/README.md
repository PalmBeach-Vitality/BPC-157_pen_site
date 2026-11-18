# klowpens.com

Research education site about the KLOW pen and vial. It links to those products on palmbeach-vitality.store. The visual system and page types follow bpc157pens.com. This project does not deploy that site.

The site is plain static HTML and CSS built with Vite and deployed to Cloudflare Workers static assets with the `cf` CLI.

## Run locally

Requires Node.js 22.18 or later.

```bash
npm install
npm run dev
```

The dev server runs at http://127.0.0.1:4918/.

## Build and deploy

```bash
npm run build
npx cf deploy
```

Worker name: `klowpens`. Canonical hosts, when the zone is on the account: `klowpens.com` and `www.klowpens.com`.

## Editorial rules

- Laboratory research use only. Not for human or veterinary use. Written for U.S. researchers.
- No dosing, no click-count instructions for use, no reconstitution guide, and no medical or athletic claim.
- The pen’s 300 clicks and 0.01 mL per click may be stated as format specifications.
- Prices and specifications are the seller’s, dated November 18, 2026.
- KLOW as sold is not an FDA-approved drug. BPC-157’s own record stays on bpc157pens.com.
- The name KLOW is not given a WADA status. BPC-157’s S0 prohibition is the component’s.
- There is no published study of the four-peptide pen or vial as one product.
- Product links use `rel="sponsored"` and `utm_source=klowpens`, `utm_medium=referral`, `utm_campaign=site`.
