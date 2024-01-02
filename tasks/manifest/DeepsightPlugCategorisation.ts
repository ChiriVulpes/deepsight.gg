import fs from "fs-extra";
import Task from "../utility/Task";
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
});
