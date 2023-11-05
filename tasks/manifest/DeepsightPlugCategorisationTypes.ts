import fs from "fs-extra";
import Task from "../utilities/Task";

export default Task("DeepsightPlugCategorisationTypes", async () => {
	await fs.copyFile("tasks/manifest/IDeepsightPlugCategorisation.ts", "docs/manifest/DeepsightPlugCategorisation.ts");

	// create d.ts version with declared const enums
	let DeepsightPlugCategorisationContents = await fs.readFile("docs/manifest/DeepsightPlugCategorisation.ts", "utf8");
	DeepsightPlugCategorisationContents = DeepsightPlugCategorisationContents
		.replace(/\/\*%(.*?)\*\//g, (match, group) => group)
		.replace(/\/\*<\*\/.*?\/\*>\*\//g, "")
		.replace(/export const/g, "export type")
		.replace(/export enum/g, "export const enum")
		.replace(/export /g, "export declare ");

	await fs.writeFile("docs/manifest/DeepsightPlugCategorisation.d.ts", DeepsightPlugCategorisationContents);
	await fs.copyFile("docs/manifest/DeepsightPlugCategorisation.d.ts", "static/manifest/DeepsightPlugCategorisation.d.ts");
});
