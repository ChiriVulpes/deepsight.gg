import Env from "utility/Env";
import { EventManager } from "utility/EventManager";
import Store from "utility/Store";

interface Request extends Omit<RequestInit, "headers" | "body"> {
	headers?: Record<string, string | undefined>;
	body?: string | object;
}

export type BungieEndpointURL = `/${string}/`;

class BungieEndpointImpl<ARGS extends any[], RESPONSE> implements BungieEndpoint<ARGS, RESPONSE> {

	public constructor (private readonly path: BungieEndpointURL, private readonly builder?: (...args: ARGS) => Request) {
	}

	public async query (...args: ARGS) {
		const request = this.builder?.(...args) ?? {};

		let body: string | undefined;
		if (typeof request.body === "object")
			body = new URLSearchParams(Object.entries(request.body)).toString();

		return fetch(`https://www.bungie.net/Platform${this.path}`, {
			credentials: "include",
			...request,
			body,
			headers: Object.fromEntries(Object.entries(this.getHeaders(request?.headers)).filter(([key, value]) => typeof value === "string") as [string, string][]),
		})
			.then(response => {
				if (response.status === 401) {
					BungieEndpoint.event.emit("authenticationFailed");
					throw new Error("Not authenticated");
				}

				return response.text();
			})
			.then(text => {
				try {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const data = JSON.parse(text) as Record<string, unknown>;
					if (data?.ErrorStatus === "WebAuthRequired") {
						BungieEndpoint.event.emit("authenticationFailed");
						throw Object.assign(new Error(data.Message as string | undefined ?? "Not authenticated"), data);
					}

					if (data?.ErrorStatus && data.ErrorStatus !== "Success")
						throw Object.assign(new Error(data.Message as string | undefined ?? data.ErrorStatus as string), data);

					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					return ("Response" in data && data.Response ? data.Response : data) as any;
				} catch (error) {
					BungieEndpoint.event.emit("error", { error: error as Error, responseText: text });
					throw error;
				}
			});
	}

	private getHeaders (headers?: Record<string, string | undefined>) {
		return {
			"Authorization": Store.items.bungieAccessToken ? `Bearer ${Store.items.bungieAccessToken}` : undefined,
			"X-API-Key": Env.FVM_BUNGIE_API_KEY,
			...headers,
		};
	}
}

interface BungieEndpoint<ARGS extends any[], RESPONSE> {
	query (...args: ARGS): Promise<RESPONSE>;
}

function BungieEndpoint (url: BungieEndpointURL) {
	return {
		request<ARGS extends any[], REQUEST extends Request> (builder: (...args: ARGS) => REQUEST) {
			return {
				returning<RESPONSE> (): BungieEndpoint<ARGS, RESPONSE> {
					return new BungieEndpointImpl<ARGS, RESPONSE>(url, builder);
				},
			};
		},
		returning<RESPONSE> (): BungieEndpoint<[], RESPONSE> {
			return new BungieEndpointImpl<[], RESPONSE>(url);
		},
	};
}

namespace BungieEndpoint {
	export interface IEvents {
		authenticationFailed: Event;
		error: { error: Error; responseText: string };
	}

	export const event = EventManager.make<IEvents>();
}

export default BungieEndpoint;
