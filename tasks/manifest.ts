import ansi from "ansicolor";
import * as fs from "fs-extra";
import * as https from "https";
import fetch from "node-fetch";
import Log from "./utilities/Log";
import Task from "./utilities/Task";

interface Manifest {
	Response: {
		version: string;
		jsonWorldContentPaths: {
			en: string;
		}
	}
}

export default Task("manifest", async () => {
	if (process.env.DEEPSIGHT_ENVIRONMENT !== "dev")
		return;

	const manifest = await fetch("https://www.bungie.net/Platform/Destiny2/Manifest/")
		.then(response => response.json())
		.then(json => (json as Manifest).Response);

	const savedVersion = await fs.readFile("static/testiny.v", "utf8").catch(() => "<no saved manifest>");
	const bungieVersion = `${manifest.version}-1.deepsight.gg`;
	if (bungieVersion === savedVersion)
		return;

	Log.info(`Bungie API is serving a new version of the Destiny manifest.\n    Old version: ${ansi.lightYellow(savedVersion)}\n    New version: ${ansi.lightBlue(bungieVersion)}`);
	Log.info("Downloading manifest...");

	await new Promise(resolve => https.get(`https://www.bungie.net/${manifest.jsonWorldContentPaths.en}`, response => response
		.pipe(fs.createWriteStream("static/testiny.json"))
		.on("finish", resolve)));
	await fs.writeFile("static/testiny.v", bungieVersion);

	Log.info("Manifest download complete.");
});
