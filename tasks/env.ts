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
		FVM_ENVIRONMENT: env("FVM_ENVIRONMENT", "prod"),
		FVM_BUNGIE_CLIENT_ID: env("FVM_BUNGIE_CLIENT_ID"),
		FVM_BUNGIE_API_KEY: env("FVM_BUNGIE_API_KEY"),
		FVM_BUNGIE_API_SECRET: env("FVM_BUNGIE_API_SECRET"),
	};

	return fs.writeFile("docs/env.json", JSON.stringify(environment));
});
