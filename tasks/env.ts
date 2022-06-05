import fs from "fs-extra";
import { IEnvironment } from "../src/utility/Env";
import Task from "./utilities/Task";

function env (key: keyof IEnvironment) {
	if (!process.env[key])
		throw new Error(`Missing environment variable ${key as string}`);

	return process.env[key] as string;
}

let environment: IEnvironment | undefined;
export default Task("env", _ => {
	environment ??= {
		FVM_BUNGIE_CLIENT_ID: env("FVM_BUNGIE_CLIENT_ID"),
		FVM_BUNGIE_API_KEY: env("FVM_BUNGIE_API_KEY"),
		FVM_BUNGIE_API_SECRET: env("FVM_BUNGIE_API_SECRET"),
	};

	return fs.writeFile("docs/env.json", JSON.stringify(environment));
});
