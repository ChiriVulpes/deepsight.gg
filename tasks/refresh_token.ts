import actions from "@actions/core";
import ansicolor from "ansicolor";
import fs from "fs/promises";
import { DestinyComponentType } from "../src/node_modules/bungie-api-ts/destiny2";
import Log from "./utilities/Log";
import Task from "./utilities/Task";

let accessToken = process.env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN;
let refreshToken = process.env.DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN;
const membershipId = process.env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_ID;
const membershipType = process.env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_TYPE;
const apiKey = process.env.DEEPSIGHT_MANIFEST_API_KEY;
const clientId = process.env.DEEPSIGHT_MANIFEST_CLIENT_ID;
const clientSecret = process.env.DEEPSIGHT_MANIFEST_CLIENT_SECRET;

interface Auth {
	token_type: "Bearer",
	access_token: string;
	expires_in: number;
	refresh_token: string;
	refresh_expires_in: number;
	membership_id: string;
}

let auth: Auth | undefined;
try {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	auth = require("../auth.json");
	accessToken = auth?.access_token;
	refreshToken = auth?.refresh_token;
	process.env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN = accessToken;
	process.env.DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN = refreshToken;
} catch { }

if (!apiKey || !membershipId || !refreshToken || !accessToken || !clientId || !clientSecret)
	throw new Error("Missing required secrets");

export default Task("refresh_token", async () => {
	const isValid = await fetch(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${DestinyComponentType.PlatformSilver}`, {
		headers: {
			"X-API-Key": apiKey,
			Authorization: `Bearer ${accessToken}`,
		},
	})
		.then(response => response.json())
		.catch(() => undefined)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		.then(response => !!response?.Response?.platformSilver?.data);

	if (isValid) {
		Log.info(ansicolor.lightGreen("Token OK!"));
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const result = await fetch("https://www.bungie.net/Platform/app/oauth/token/", {
		method: "POST",
		headers: {
			"X-API-Key": apiKey,
			Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
	}).then(response => response.json()).catch(err => {
		Log.error(err);
	}) as Auth | undefined;

	if (!result?.access_token || !result.refresh_token)
		throw new Error("Unable to refresh token");

	Log.info(ansicolor.lightGreen("Token refreshed!"));

	process.env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN = result.access_token;
	process.env.DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN = result.refresh_token;

	if (auth) {
		await fs.writeFile("../auth.json", JSON.stringify(result));

	} else {
		actions.setSecret(result.access_token);
		actions.setSecret(result.refresh_token);

		actions.setOutput("access_token", result.access_token);
		actions.setOutput("refresh_token", result.refresh_token);
	}
});
