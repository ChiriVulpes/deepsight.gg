import fs from "fs-extra";
import Task from "../utilities/Task";
import DeepsightPlugCategorisation from "./plugtype/DeepsightPlugCategorisation";

export default Task("DeepsightPlugCategorisation", async () => {
	const result = await DeepsightPlugCategorisation.resolve();

	await fs.mkdirp("docs/manifest");

	const stream = fs.createWriteStream("docs/manifest/DeepsightPlugCategorisation.json");
	stream.write("{\n\t");
	const entries = Object.entries(result);
	let i = 0;
	for (const [key, def] of entries)
		stream.write(`${i++ ? ",\n\t" : ""}"${key}": ${JSON.stringify(def, null, "\t")
			.replace(/\n/g, "\n\t")}`);

	stream.write("\n}\n");
	stream.close();

	if (!stream.writableFinished)
		await new Promise(resolve => stream.on("finish", resolve));

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
