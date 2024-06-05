import { Debug } from "utility/Debug";
import type { EndpointRequest } from "utility/endpoint/Endpoint";
import Endpoint from "utility/endpoint/Endpoint";
import Env from "utility/Env";
import { EventManager } from "utility/EventManager";
import type ProfileManager from "utility/ProfileManager";
import type { IProfileStorage } from "utility/Store";

export type BungieEndpointURL = `/${string}/`;
export type BungieEndpointURLResolvable<ARGS extends any[]> = BungieEndpointURL | ((...args: ARGS) => BungieEndpointURL);

export interface BungieEndpointResponse {
	Response: number;
	ErrorCode: number;
	ThrottleSeconds: number;
	ErrorStatus: string;
	Message: string;
	MessageData: Record<string, string>;
	DetailedErrorTrace: string;
}

class BungieEndpointImpl<ARGS extends any[], RESPONSE> extends Endpoint<RESPONSE, RESPONSE, ARGS> implements BungieEndpoint<ARGS, RESPONSE> {

	private allowedErrorStatuses: string[] = [];
	private subdomain = "www";
	private optionalAuth?: true;
	private profileSupplier?: (...args: ARGS) => IProfileStorage;

	public constructor (path: BungieEndpointURLResolvable<ARGS>, builder?: (...args: ARGS) => EndpointRequest | Promise<EndpointRequest>) {
		super(path, builder);
	}

	public allowErrorStatus (status: string) {
		this.allowedErrorStatuses.push(status);
		return this;
	}

	public setSubdomain (subdomain: string) {
		this.subdomain = subdomain;
		return this;
	}

	public setOptionalAuth (optionalAuth = true) {
		if (optionalAuth)
			this.optionalAuth = optionalAuth;
		else
			delete this.optionalAuth;
		return this;
	}

	public setProfile (supplier?: (...args: ARGS) => IProfileStorage) {
		this.profileSupplier = supplier;
		return this;
	}

	public override async query (...args: ARGS): Promise<RESPONSE & { _headers: Headers }> {
		const attempts = 3;
		const lastAttempt = attempts - 1;
		for (let attempt = 0; attempt < 3; attempt++) {
			let error401d: Error | undefined;
			let headers: Headers;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const result = await this.fetch(undefined, ...args)
				.then(response => {
					headers = response.headers;

					if (response.status === 401) {
						error401d = new Error("Not authenticated");
						return;
					}

					return response.text();
				})
				.then(text => {
					if (!text)
						return;

					try {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						let data = JSON.parse(text) as Record<string, unknown>;
						if (data?.ErrorStatus === "WebAuthRequired") {
							error401d = Object.assign(new Error(data.Message as string | undefined ?? "Not authenticated"), data);
							return;
						}

						if (Debug.emulateBungieErrorSystemDisabled) {
							data = {
								ErrorCode: 5,
								ThrottleSeconds: 0,
								ErrorStatus: "SystemDisabled",
								Message: "This system is temporarily disabled for maintenance.",
								MessageData: {},
								headers,
							};
						}

						if (data?.ErrorStatus && data.ErrorStatus !== "Success" && !this.allowedErrorStatuses.includes(data.ErrorStatus as string)) {
							if (data.ErrorStatus === "SystemDisabled")
								BungieEndpoint.event.emit("apiDown");

							throw Object.assign(new Error(data.Message as string | undefined ?? data.ErrorStatus as string), data);
						}

						BungieEndpoint.event.emit("querySuccess");
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						return ("Response" in data && data.Response ? data.Response : data) as any;
					} catch (error) {
						BungieEndpoint.event.emit("error", { error: error as Error, responseText: text, headers });
						throw error;
					}
				});

			if (error401d) {
				if (attempt >= lastAttempt) {
					BungieEndpoint.event.emit("authenticationFailed");
					throw error401d;
				} else {
					await this.validateAuthorisation(true);
					continue;
				}
			}

			Object.defineProperty(result, "_headers", {
				enumerable: false,
				get: () => headers,
			});
			return result;
		}

		throw new Error("This should never happen");
	}

	protected override resolvePath (...args: ARGS): string {
		return `https://${this.subdomain}.bungie.net/Platform${super.resolvePath(...args)}`;
	}

	protected override getDefaultRequest (): EndpointRequest {
		return {
			credentials: "include",
		};
	}

	protected override async getHeaders (headers?: Record<string, string | undefined>, ...args: ARGS) {
		return {
			"Authorization": headers?.Authorization ? undefined : await this.getAuthorisation(...args),
			"X-API-Key": Env.DEEPSIGHT_BUNGIE_API_KEY,
			...headers,
		};
	}

	private async getAuthorisation (...args: ARGS) {
		if (!this.optionalAuth)
			await this.validateAuthorisation();

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const profile = this.profileSupplier?.(...args) ?? ((window as any).ProfileManager as typeof ProfileManager).get()?.data;
		if (!profile)
			return undefined;

		return profile.accessToken ? `Bearer ${profile.accessToken}` : undefined;
	}

	private async validateAuthorisation (force?: true) {
		let authorisationPromise: Promise<void> | undefined;
		BungieEndpoint.event.emit("validateAuthorisation", { setAuthorisationPromise: promise => void (authorisationPromise = promise), force });
		await authorisationPromise;
	}
}

interface BungieEndpoint<ARGS extends any[], RESPONSE> {
	query (...args: ARGS): Promise<RESPONSE & { _headers: Headers }>;
	allowErrorStatus (status: string): this;
	setSubdomain (subdomain: string): this;
	setOptionalAuth (optionalAuth?: boolean): this;
	setProfile (supplier?: (...args: ARGS) => IProfileStorage): this;
}

namespace BungieEndpoint {

	export interface IEvents {
		validateAuthorisation: { setAuthorisationPromise (promise: Promise<void>): void; force?: true };
		authenticationFailed: Event;
		error: { error: Error; responseText: string, headers: Headers };
		apiDown: Event;
		querySuccess: Event;
	}

	export const event = EventManager.make<IEvents>();

	export function at<ARGS extends any[] = any[]> (url: BungieEndpointURLResolvable<ARGS>) {
		return {
			request<ARGS2 extends ARGS, REQUEST extends EndpointRequest> (builder: (...args: ARGS2) => REQUEST | Promise<REQUEST>) {
				return {
					endpoint (): BungieEndpoint<ARGS2, BungieEndpointResponse> {
						return new BungieEndpointImpl<ARGS2, BungieEndpointResponse>(url, builder);
					},
					returning<RESPONSE> (): BungieEndpoint<ARGS2, RESPONSE> {
						return new BungieEndpointImpl<ARGS2, RESPONSE>(url, builder);
					},
				};
			},
			returning<RESPONSE> (): BungieEndpoint<ARGS, RESPONSE> {
				return new BungieEndpointImpl<ARGS, RESPONSE>(url);
			},
		};
	}
}

export default BungieEndpoint;
