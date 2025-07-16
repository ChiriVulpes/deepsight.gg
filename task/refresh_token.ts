import * as actions from "@actions/core";
import ansicolor from "ansicolor";
import fs from "fs/promises";
import { Task } from "task";
import Env from "./utility/Env";
import Log from "./utility/Log";

const membershipId = Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_ID;
const membershipType = Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_TYPE;
const apiKey = Env.DEEPSIGHT_MANIFEST_API_KEY;
const clientId = Env.DEEPSIGHT_MANIFEST_CLIENT_ID;
const clientSecret = Env.DEEPSIGHT_MANIFEST_CLIENT_SECRET;

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
	Env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN = auth?.access_token;
	Env.DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN = auth?.refresh_token;
} catch { }

if (!apiKey || !membershipId || !Env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN || !Env.DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN || !clientId || !clientSecret)
	throw new Error("Missing required secrets: "
		+ Object.entries({
			apiKey: !!apiKey,
			membershipId: !!membershipId,
			accessToken: !!Env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN,
			refreshToken: !!Env.DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN,
			clientId: !!clientId,
			clientSecret: !!clientSecret,
		})
			.filter(([name, present]) => !present)
			.map(([name]) => name)
			.join(", "));

export default Task("refresh_token", async () => {
	const isValid = await fetch(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=105`, {
		headers: {
			"User-Agent": "deepsight.gg:build/0.0.0",
			"X-API-Key": apiKey,
			Authorization: `Bearer ${Env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN}`,
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
			"User-Agent": "deepsight.gg:build/0.0.0",
			"X-API-Key": apiKey,
			Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: `grant_type=refresh_token&refresh_token=${Env.DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN}`,
	}).then(response => response.json()).catch(err => {
		Log.error(err);
	}) as Auth | undefined;

	if (!result?.access_token || !result.refresh_token)
		throw new Error("Unable to refresh token");

	Log.info(ansicolor.lightGreen("Token refreshed!"));

	Env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN = result.access_token;
	Env.DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN = result.refresh_token;

	if (auth) {
		await fs.writeFile("./auth.json", JSON.stringify(result));

	} else {
		actions.setSecret(result.access_token);
		actions.setSecret(result.refresh_token);

		actions.setOutput("access_token", result.access_token);
		actions.setOutput("refresh_token", result.refresh_token);
	}
});
