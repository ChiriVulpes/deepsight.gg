import chokidar from "chokidar";
import sass from "./sass";
import _static from "./static";
import { tsWatch } from "./ts";
import Task from "./utilities/Task";

export default Task("watch", async task => {
	chokidar.watch(["style/**/*.scss"], { ignoreInitial: true })
		.on("all", () =>
			task.debounce(sass));
	chokidar.watch(["static/**/*"], { ignoreInitial: true })
		.on("all", () =>
			task.debounce(_static));

	await task.run(tsWatch);
	// chokidar.watch(["client/**/*.ts"], { ignoreInitial: true })
	// 	.on("all", () =>
	// 		task.debounce(ts));
});
