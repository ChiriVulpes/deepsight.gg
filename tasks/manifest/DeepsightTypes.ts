import fs from "fs-extra";
import Task from "../utility/Task";

export default Task("DeepsightTypes", async () => {
	await emit("DeepsightPlugCategorisation");
});

async function emit (path: string) {
	await fs.copyFile(`tasks/manifest/I${path}.ts`, `docs/manifest/${path}.ts`);

	// create d.ts version with declared const enums
	let contents = await fs.readFile(`docs/manifest/${path}.ts`, "utf8");
	contents = contents
		.replace(/\/\*%(.*?)\*\//g, (match, group) => group)
		.replace(/\/\*<\*\/.*?\/\*>\*\//g, "")
		.replace(/export const/g, "export type")
		.replace(/export enum/g, "export const enum")
		.replace(/export /g, "export declare ");

	await fs.writeFile(`docs/manifest/${path}.d.ts`, contents);
	await fs.copyFile(`docs/manifest/${path}.d.ts`, `static/manifest/${path}.d.ts`);
}
