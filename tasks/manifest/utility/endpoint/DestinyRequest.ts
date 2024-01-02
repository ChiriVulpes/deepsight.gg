import type { ServerResponse } from "bungie-api-ts/destiny2";
import Env from "../../../utility/Env";
import Log from "../../../utility/Log";

const accessToken = Env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN;
const apiKey = Env.DEEPSIGHT_MANIFEST_API_KEY;

export default async function <T> (path: string) {
	return fetch(path.startsWith("https://") ? path : `https://www.bungie.net/Platform/${path}`, {
		headers: {
			"X-API-Key": apiKey!,
			Authorization: `Bearer ${accessToken}`,
		},
	})
		.then(response => response.json().catch(async err => {
			console.log(await response.text());
			throw err;
		}) as Promise<ServerResponse<T>>)
		.then(response => {
			if (!response.Response)
				throw new Error(`${response.ErrorCode} ${response.Message}`);

			return response.Response;
		})
		.catch(err => {
			Log.error(err);
			return undefined;
		});
}
