import { Task } from "task";
import inspect from "./inspect";
import sass from "./sass";
import _static from "./static";
import { tsWatch } from "./ts";
import Hash from "./utility/Hash";

export default Task("watch", async task => {
	task.watch(["style/**/*.scss"], () => task.debounce(sass));

	task.watch(["static/**/*", "./task/generate_enums.ts", "./task/deepsight_manifest.ts", "./task/manifest/**/*"], async (event, path) => true
		&& !path?.endsWith("Enums.d.ts") && !path?.endsWith("DeepsightPlugCategorisation.d.ts")
		&& (await Hash.fileChanged(path))
		&& task.debounce(_static, path));

	await Promise.all([
		task.run(inspect),
		task.run(tsWatch),
	]);
});
