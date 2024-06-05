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
			Log.error(err.message.includes("disabled for maintenance") ? err.message : err);
			return undefined;
		});
}
