type AssetBinding = {
	fetch(input: Request): Promise<Response>;
};

type Env = {
	ASSETS: AssetBinding;
};

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (url.hostname === "www.nadpens.com") {
			url.hostname = "nadpens.com";
			url.protocol = "https:";
			return Response.redirect(url.toString(), 301);
		}
		return env.ASSETS.fetch(request);
	},
};
