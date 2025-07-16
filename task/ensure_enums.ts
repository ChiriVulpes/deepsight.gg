import fs from "fs-extra";
import { Task } from "task";
import destiny_manifest from "./destiny_manifest";
import generate_enums from "./generate_enums";

export default Task("ensure_enums", async task => {
	if (await fs.pathExists("task/manifest/Enums.d.ts"))
		return;

	await task.run(destiny_manifest);
	await task.run(generate_enums);
});
