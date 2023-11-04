import chokidar from "chokidar";
import sass from "./sass";
import _static from "./static";
import { tsWatch } from "./ts";
import Hash from "./utilities/Hash";
import Task from "./utilities/Task";

export default Task("watch", async task => {
	chokidar.watch(["style/**/*.scss"], { ignoreInitial: true })
		.on("all", () =>
			task.debounce(sass));

	chokidar.watch(["static/**/*", "./tasks/deepsight_manifest.ts", "./tasks/manifest/**/*"], { ignoreInitial: true })
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		.on("all", async (event, path) => true
			&& !path?.endsWith("Enums.d.ts")
			&& (await Hash.fileChanged(path))
			&& task.debounce(_static, path));

	await task.run(tsWatch);
});
