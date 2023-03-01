import fs from "fs-extra";
import fetch from "node-fetch";
import Task from "./utilities/Task";

export default Task("install", async () => {
	await Task.cli({ cwd: "src" }, "PATH:npm", "install");
	if (process.env.DEEPSIGHT_ENVIRONMENT === "dev")
		await Task.cli({ cwd: "src" }, "PATH:npm", "install", "bungie-api-ts@latest");

	await fetch("https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/generated-enums.ts")
		.then(response => response.text())
		.then(text => {
			text = text.replace(/export const/g, "export declare const");
			return fs.writeFile("src/node_modules/bungie-api-ts/destiny2/generated-enums.d.ts", text);
		});

	await fs.appendFile("src/node_modules/bungie-api-ts/destiny2/index.d.ts", "export * from './generated-enums';\n");

	await fs.mkdirp("static/js/vendor");
	await fs.copyFile("src/node_modules/wicg-inert/dist/inert.min.js", "static/js/vendor/inert.min.js");
});
