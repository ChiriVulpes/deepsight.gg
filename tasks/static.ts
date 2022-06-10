import fs from "fs-extra";
import Task from "./utilities/Task";

export default Task("static", async () => {
	while (!await fs.copy("static", "docs")
		.then(() => true).catch(() => false));
});
