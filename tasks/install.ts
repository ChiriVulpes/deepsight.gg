import ansi from "ansicolor";
import fs from "fs-extra";
import * as path from "path";
import Env from "./utility/Env";
import Log from "./utility/Log";
import Task from "./utility/Task";

export default Task("install", async () => {
	const lockFilePath = path.join(process.cwd(), "package-lock.json");
	let lockFileData = JSON.parse(fs.readFileSync(lockFilePath, "utf8")) as { "@deepsight.gg/enums"?: string };
	let sha = lockFileData["@deepsight.gg/enums"];

	await Task.cli({ cwd: "src" }, "PATH:npm", "install");
	if (Env.DEEPSIGHT_ENVIRONMENT === "dev") {
		Log.info(`Installing ${ansi.lightCyan("bungie-api-ts@latest")}...`);
		await Task.cli({ cwd: "src" }, "PATH:npm", "install", "bungie-api-ts@latest");
	}

	if (Env.DEEPSIGHT_ENVIRONMENT === "dev") {
		const commit = await fetch("https://api.github.com/repos/ChiriVulpes/deepsight.gg/commits/manifest")
			.then(response => response.json()) as { sha: string };
		if (sha !== commit.sha) {
			sha = commit.sha;
			Log.info("Updating to @deepsight.gg/enums @", ansi.lightGreen(sha));
		}

	} else {
		Log.info("Including @deepsight.gg/enums @", ansi.lightGreen(sha));
	}

	if (!sha)
		throw new Error("No commit sha found for @deepsight.gg/enums");

	await fetch(`https://raw.githubusercontent.com/ChiriVulpes/deepsight.gg/${sha}/Enums.d.ts`)
		.then(response => response.text())
		.then(text => fs.writeFile("static/manifest/Enums.d.ts", text));

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	lockFileData = JSON.parse(fs.readFileSync(lockFilePath, "utf8"));
	if (lockFileData["@deepsight.gg/enums"] !== sha) {
		lockFileData["@deepsight.gg/enums"] = sha;
		fs.writeFileSync(lockFilePath, JSON.stringify(lockFileData, null, "\t") + "\n");
	}
});
