import fs from "fs-extra";
import fetch from "node-fetch";
import Task from "./utilities/Task";

export default Task("install", async () => {
	// uncomment when there's more than one dependency
	// await Task.cli({ cwd: "src" }, "PATH:npm", "install");
	await Task.cli({ cwd: "src" }, "PATH:npm", "install", "bungie-api-ts@latest");
	await fetch("https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/generated-enums.ts")
		.then(response => response.text())
		.then(text => {
			text = text.replace(/export const enum (\w+)/g, "export type $1 = $1Enum;\ndeclare enum $1Enum");
			const enums = [...text.matchAll(/export type (\w+)/g)].map(([, enumName]) => enumName);
			text += `\nexport interface DestinyGeneratedEnums {\n${(
				enums.map(enumName => `  ${enumName}: typeof ${enumName}Enum;`).join("\n")
			)}\n}`;
			return fs.writeFile("src/node_modules/bungie-api-ts/generated-enums.d.ts", text);
		});
});
