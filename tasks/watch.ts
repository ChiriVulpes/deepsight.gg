import chokidar from "chokidar";
import inspect from "./inspect";
import sass from "./sass";
import _static from "./static";
import { tsWatch } from "./ts";
import Hash from "./utility/Hash";
import Task from "./utility/Task";

export default Task("watch", async task => {
	chokidar.watch(["style/**/*.scss"], { ignoreInitial: true })
		.on("all", () =>
			task.debounce(sass));

	chokidar.watch(["static/**/*", "./tasks/generate_enums.ts", "./tasks/deepsight_manifest.ts", "./tasks/manifest/**/*"], { ignoreInitial: true })
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		.on("all", async (event, path) => true
			&& !path?.endsWith("Enums.d.ts") && !path?.endsWith("DeepsightPlugCategorisation.d.ts")
			&& (await Hash.fileChanged(path))
			&& task.debounce(_static, path));

	await Promise.all([
		task.run(inspect),
		task.run(tsWatch),
	]);
});
