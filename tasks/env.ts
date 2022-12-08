import fs from "fs-extra";
import type { IEnvironment } from "../src/utility/Env";
import Task from "./utilities/Task";

function env<KEY extends keyof IEnvironment> (key: KEY, orElse?: IEnvironment[KEY]) {
	const result = process.env[key] ?? orElse;
	if (!result)
		throw new Error(`Missing environment variable ${key as string}`);

	return result as IEnvironment[KEY];
}

let environment: IEnvironment | undefined;
export default Task("env", _ => {
	environment ??= {
		DEEPSIGHT_ENVIRONMENT: env("DEEPSIGHT_ENVIRONMENT", "prod"),
		DEEPSIGHT_BUNGIE_CLIENT_ID: env("DEEPSIGHT_BUNGIE_CLIENT_ID"),
		DEEPSIGHT_BUNGIE_API_KEY: env("DEEPSIGHT_BUNGIE_API_KEY"),
		DEEPSIGHT_BUNGIE_API_SECRET: env("DEEPSIGHT_BUNGIE_API_SECRET"),
	};

	return fs.writeFile("docs/env.json", JSON.stringify(environment));
});
