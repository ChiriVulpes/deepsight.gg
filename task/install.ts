import ansi from "ansicolor";
import { Task } from "task";
import Env from "./utility/Env";
import Log from "./utility/Log";

export default Task("install", async task => {
	await task.exec({ cwd: "src" }, "PATH:npm", "install");

	if (Env.DEEPSIGHT_ENVIRONMENT === "dev") {
		Log.info(`Installing ${ansi.lightCyan("bungie-api-ts@latest")}...`);
		await task.exec({ cwd: "src" }, "PATH:npm", "install", "bungie-api-ts@latest", "--no-fund", "--prefer-online", "--no-audit");
	}

	Log.info(`Installing ${ansi.lightCyan("deepsight.gg@latest")}...`);
	await task.exec({ cwd: "src" }, "PATH:npm", "install", "deepsight.gg@latest", "--no-fund", "--prefer-online", "--no-audit");
});
