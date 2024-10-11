import fs from "fs-extra";
import type { IEnvironment } from "../src/utility/Env";
import Task from "./utility/Task";

function env<KEY extends keyof IEnvironment> (key: KEY, orElse?: IEnvironment[KEY]) {
	const result = process.env[key] ?? orElse;
	if (!result)
		throw new Error(`Missing environment variable ${key as string}`);

	return result as IEnvironment[KEY];
}

function optional<KEY extends keyof IEnvironment> (key: KEY) {
	return process.env[key] as IEnvironment[KEY];
}

let environment: IEnvironment | undefined;
export default Task("env", _ => {
	const envType = env("DEEPSIGHT_ENVIRONMENT", "prod");
	environment ??= {
		DEEPSIGHT_ENVIRONMENT: envType,
		DEEPSIGHT_BUNGIE_CLIENT_ID: env("DEEPSIGHT_BUNGIE_CLIENT_ID"),
		DEEPSIGHT_BUNGIE_API_KEY: env("DEEPSIGHT_BUNGIE_API_KEY"),
		DEEPSIGHT_BUNGIE_API_SECRET: env("DEEPSIGHT_BUNGIE_API_SECRET"),
		DEEPSIGHT_BUILD_NUMBER: optional("DEEPSIGHT_BUILD_NUMBER"),
		DEEPSIGHT_BUILD_SHA: optional("DEEPSIGHT_BUILD_SHA"),
		DEEPSIGHT_PATH: env("DEEPSIGHT_PATH"),
		...envType !== "dev" ? undefined : {
			DEEPSIGHT_MANIFEST_CLIENT_ID: env("DEEPSIGHT_MANIFEST_CLIENT_ID"),
			DEEPSIGHT_MANIFEST_CLIENT_SECRET: env("DEEPSIGHT_MANIFEST_CLIENT_SECRET"),
		},
	};

	return fs.writeFile("docs/env.json", JSON.stringify(environment));
});
