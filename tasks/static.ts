import ansi from "ansicolor";
import fs from "fs-extra";
import * as path from "path";
import type deepsight_manifest from "./deepsight_manifest";
import DeepsightTypes from "./manifest/DeepsightTypes";
import Env from "./utility/Env";
import Log from "./utility/Log";
import Task from "./utility/Task";

export default Task("static", async (task, file?: string) => {
	file = file?.replace(/\\/g, "/");
	if (file) {
		Log.info("Detected file change:", ansi.lightGreen(file));
		if (file === "tasks/generate_enums.ts")
			Env.ENUMS_NEED_UPDATE = "true";
	}


	while (!await fs.copy("static", "docs")
		.then(() => true).catch(() => false));

	await fs.copyFile("docs/manifest/Interfaces.d.ts", "src/node_modules/deepsight.gg/Interfaces.d.ts");

	if (!Env.DEEPSIGHT_PATH)
		throw new Error("DEEPSIGHT_PATH env var must be set");

	const html = await fs.readFile("docs/index.html", "utf8");
	await fs.writeFile("docs/index.html", html.replace(/\.\//g, Env.DEEPSIGHT_PATH));

	if (Env.DEEPSIGHT_ENVIRONMENT !== "dev") {
		await task.run(DeepsightTypes);
		// manifests are handled in a separate task in the build
		await fs.rm("docs/manifest", { recursive: true });
		await fs.rm("docs/manifest-auth.html");
		return;
	}

	// uncache deepsight manifest generation stuff before using it in case there were changes
	const deepsightManifestEntryPoint = path.join(__dirname, "deepsight_manifest.ts");
	const generateEnumsEntryPoint = path.join(__dirname, "generate_enums.ts");
	const deepsightManifestGenerationDir = path.join(__dirname, "manifest") + path.sep;
	const cachedModulePaths = Object.keys(require.cache);
	// console.log(cachedModulePaths);
	// console.log(deepsightManifestEntryPoint, deepsightManifestGenerationDir);
	for (const modulePath of cachedModulePaths) {
		if (modulePath === deepsightManifestEntryPoint || modulePath === generateEnumsEntryPoint)
			delete require.cache[modulePath];

		if (modulePath.startsWith(deepsightManifestGenerationDir))
			delete require.cache[modulePath];
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
	const t = require("./deepsight_manifest").default as typeof deepsight_manifest;
	await task.run(t);

	await fs.rm("src/node_modules/deepsight.gg", { recursive: true });
	await fs.copy("docs/manifest", "src/node_modules/deepsight.gg", { recursive: true });
});
