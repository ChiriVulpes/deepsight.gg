import fs from "fs-extra";
import * as path from "path";
import type deepsight_manifest from "./deepsight_manifest";
import Task from "./utilities/Task";

export default Task("static", async task => {
	while (!await fs.copy("static", "docs")
		.then(() => true).catch(() => false));

	if (process.env.DEEPSIGHT_ENVIRONMENT !== "dev") {
		// manifests are handled in a separate task in the build
		await fs.rm("docs/manifest", { recursive: true });
		return;
	}

	// uncache deepsight manifest generation stuff before using it in case there were changes
	const deepsightManifestEntryPoint = path.join(__dirname, "deepsight_manifest.ts");
	const deepsightManifestGenerationDir = path.join(__dirname, "manifest") + path.sep;
	const cachedModulePaths = Object.keys(require.cache);
	// console.log(cachedModulePaths);
	// console.log(deepsightManifestEntryPoint, deepsightManifestGenerationDir);
	for (const modulePath of cachedModulePaths) {
		if (modulePath === deepsightManifestEntryPoint)
			delete require.cache[modulePath];

		if (modulePath.startsWith(deepsightManifestGenerationDir))
			delete require.cache[modulePath];
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
	const t = require("./deepsight_manifest").default as typeof deepsight_manifest;
	await task.run(t);
});
