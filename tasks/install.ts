import ansi from "ansicolor";
import Env from "./utility/Env";
import Log from "./utility/Log";
import Task from "./utility/Task";

export default Task("install", async () => {
	await Task.cli({ cwd: "src" }, "PATH:npm", "install");

	if (Env.DEEPSIGHT_ENVIRONMENT === "dev") {
		Log.info(`Installing ${ansi.lightCyan("bungie-api-ts@latest")}...`);
		await Task.cli({ cwd: "src" }, "PATH:npm", "install", "bungie-api-ts@latest", "--no-fund", "--prefer-online", "--no-audit");
	}

	Log.info(`Installing ${ansi.lightCyan("deepsight.gg@latest")}...`);
	await Task.cli({ cwd: "src" }, "PATH:npm", "install", "deepsight.gg@latest", "--no-fund", "--prefer-online", "--no-audit");
});
