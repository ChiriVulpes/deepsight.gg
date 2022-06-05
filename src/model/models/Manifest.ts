import Model from "model/Model";
import GetManifest from "utility/bungie/endpoint/destiny2/GetManifest";

export default new Model("manifest", {
	resetTime: "Daily",
	generate: async () => {
		const manifest = await GetManifest.query();
		return fetch(`https://www.bungie.net/${manifest.jsonWorldContentPaths.en}`)
			.then(response => response.json());
	},
});
