import type { ServerResponse } from "bungie-api-ts/destiny2";
import Env from "../../../utility/Env";
import Log from "../../../utility/Log";

export default async function <T> (path: string) {
	return fetch(path.startsWith("https://") ? path : `https://www.bungie.net/Platform/${path}`, {
		headers: {
			"X-API-Key": Env.DEEPSIGHT_MANIFEST_API_KEY!,
			Authorization: `Bearer ${Env.DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN}`,
		},
	})
		.then(response => response.text())
		.then(text => {
			try {
				return JSON.parse(text) as ServerResponse<T>;
			} catch (err) {
				if (text.includes("Server Error")) {
					const [code, message, detail] = text.match(/<h2>(\d+) - ([^<]*)<\/h2>(\n|\s)*<h3>([^<]*)<\/h3>/) ?? [];
					if (message) {
						return {
							Response: undefined,
							ErrorCode: +code!,
							ThrottleSeconds: 0,
							ErrorStatus: message,
							Message: detail || "",
							MessageData: {},
						} satisfies ServerResponse<undefined>;
					}
				}

				console.log(text);
				throw err;
			}
		})
		.then(response => {
			if (!response.Response)
				throw new Error(response.Message);

			return response.Response;
		})
		.catch((err: Error) => {
			if (err.message.includes("invalid credentials")) {
				Log.error(err.message);
				Log.error(`1. Get auth code: https://www.bungie.net/en/oauth/authorize?client_id=${Env.DEEPSIGHT_MANIFEST_CLIENT_ID}&response_type=code`);
				Log.error("2. Authenticate: https://localhost:8094/manifest-auth.html?code=AUTH_CODE_FROM_STEP_1");
				Log.error("3. Replace secrets DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN and DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN: https://github.com/ChiriVulpes/deepsight.gg/settings/secrets/actions");
			} else {
				Log.error(err.message.includes("disabled for maintenance") ? err.message : err);
			}

			return undefined;
		});
}
