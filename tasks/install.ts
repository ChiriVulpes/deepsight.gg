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
			text = text.replace(/export const enum (\w+) {((?:.|\r|\n)*?)}/g, (match, name: string, contents: string) =>
				`declare enum ${name}Enum {${contents}}\nexport type ${name} = ${name}Enum;\nexport namespace ${name} {\n${(
					[...contents.matchAll(/\s+(\w+)(?:\s*=\s*\d+)?,/g)]
						.map(([, enumKey]) => `  export type ${enumKey} = ${name}Enum.${enumKey};`)
						.join("\n")
				)}\n}`);
			text += `\nexport interface DestinyGeneratedEnums {\n${(
				[...text.matchAll(/export type (\w+) = \w+Enum;/g)]
					.map(([, enumName]) => enumName)
					.map(enumName => `  ${enumName}: typeof ${enumName}Enum;`)
					.join("\n")
			)}\n}\nexport {};`;
			return fs.writeFile("src/node_modules/bungie-api-ts/generated-enums.d.ts", text);
		});
});
