import fs from "fs-extra";
import destiny_manifest from "./destiny_manifest";
import generate_enums from "./generate_enums";
import Task from "./utilities/Task";

export default Task("ensure_enums", async task => {
	if (await fs.pathExists("tasks/manifest/Enums.d.ts"))
		return;

	await task.run(destiny_manifest);
	await task.run(generate_enums);
});
