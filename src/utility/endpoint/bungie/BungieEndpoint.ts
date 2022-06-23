import type { EndpointRequest } from "utility/endpoint/Endpoint";
import Endpoint from "utility/endpoint/Endpoint";
import Env from "utility/Env";
import { EventManager } from "utility/EventManager";
import Store from "utility/Store";

export type BungieEndpointURL = `/${string}/`;
export type BungieEndpointURLResolvable<ARGS extends any[]> = BungieEndpointURL | ((...args: ARGS) => BungieEndpointURL);

class BungieEndpointImpl<ARGS extends any[], RESPONSE> extends Endpoint<RESPONSE, ARGS> implements BungieEndpoint<ARGS, RESPONSE> {

	public constructor (path: BungieEndpointURLResolvable<ARGS>, builder?: (...args: ARGS) => EndpointRequest | Promise<EndpointRequest>) {
		super(path, builder);
	}

	public override async query (...args: ARGS) {
		return this.fetch(undefined, ...args)
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

	protected override resolvePath (...args: ARGS): string {
		return `https://www.bungie.net/Platform${super.resolvePath(...args)}`;
	}

	protected override getDefaultRequest (): EndpointRequest {
		return {
			credentials: "include",
		};
	}

	protected override async getHeaders (headers?: Record<string, string | undefined>) {
		return {
			"Authorization": headers?.Authorization ? undefined : await this.getAuthorisation(),
			"X-API-Key": Env.FVM_BUNGIE_API_KEY,
			...headers,
		};
	}

	private async getAuthorisation () {
		let authorisationPromise: Promise<void> | undefined;
		BungieEndpoint.event.emit("validateAuthorisation", { setAuthorisationPromise: promise => void (authorisationPromise = promise) });
		await authorisationPromise;
		return Store.items.bungieAccessToken ? `Bearer ${Store.items.bungieAccessToken}` : undefined;
	}
}

interface BungieEndpoint<ARGS extends any[], RESPONSE> {
	query (...args: ARGS): Promise<RESPONSE>;
}

namespace BungieEndpoint {
	export interface IEvents {
		validateAuthorisation: { setAuthorisationPromise (promise: Promise<void>): void; };
		authenticationFailed: Event;
		error: { error: Error; responseText: string };
	}

	export const event = EventManager.make<IEvents>();

	export function at<ARGS extends any[] = any[]> (url: BungieEndpointURLResolvable<ARGS>) {
		return {
			request<ARGS2 extends ARGS, REQUEST extends EndpointRequest> (builder: (...args: ARGS2) => REQUEST | Promise<REQUEST>) {
				return {
					returning<RESPONSE> (): BungieEndpoint<ARGS2, RESPONSE> {
						return new BungieEndpointImpl<ARGS2, RESPONSE>(url, builder);
					},
				};
			},
			returning<RESPONSE> (): BungieEndpoint<[], RESPONSE> {
				return new BungieEndpointImpl<[], RESPONSE>(url);
			},
		};
	}
}

export default BungieEndpoint;
