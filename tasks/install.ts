import ansi from "ansicolor";
import Env from "./utility/Env";
import Log from "./utility/Log";
import Task from "./utility/Task";

export default Task("install", async () => {
	if (Env.DEEPSIGHT_ENVIRONMENT === "dev") {
		await Task.cli({ cwd: "src" }, "PATH:npm", "install");
		Log.info(`Installing ${ansi.lightCyan("bungie-api-ts@latest")} and ${ansi.lightCyan("deepsight.gg@latest")}...`);
		await Task.cli({ cwd: "src" }, "PATH:npm", "install", "bungie-api-ts@latest", "deepsight.gg@latest");
	}
});
