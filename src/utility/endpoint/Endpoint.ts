export interface EndpointRequest extends Omit<RequestInit, "headers" | "body"> {
	headers?: Record<string, string | undefined>;
	body?: string | object;
	search?: string | object;
}

export default class Endpoint<T, R = T, ARGS extends any[] = []> {
	public constructor (protected readonly path: string | ((...args: ARGS) => string), protected readonly builder?: (...args: ARGS) => undefined | EndpointRequest | Promise<undefined | EndpointRequest>) { }

	public async query (...args: ARGS): Promise<R & { _headers: Headers }> {
		const path = this.resolvePath(...args);
		let headers: Headers;
		return this.fetch(path, ...args)
			.then(response => {
				headers = response.headers;
				return response.text();
			})
			.then(text => {
				if (path.endsWith(".json")) {
					// text = text
					// 	.replace(/\s*\/\/[^\n"]*(?=\n)/g, "")
					// 	.replace(/(?<=\n)\s*\/\/[^\n]*(?=\n)/g, "")
					// 	.replace(/,(?=[^}\]"\d\w_-]*?[}\]])/gs, "");

					let parsed: T | undefined;
					try {
						parsed = JSON.parse(text) as T;
					} catch (err) {
						console.warn(text);
						throw err;
					}

					const result = this.process(parsed) as R & { _headers: Headers };

					Object.defineProperty(result, "_headers", {
						enumerable: false,
						get: () => headers,
					});
					return result;
				}

				throw new Error("Unknown file type");
			});
	}

	public process (received: T): R {
		return received as any as R;
	}

	protected async fetch (path: string | undefined, ...args: ARGS) {
		path ??= this.resolvePath(...args);

		const request = {
			...this.getDefaultRequest(...args),
			...await this.builder?.(...args) ?? {},
		};

		let body: string | undefined;
		if (typeof request.body === "object") {
			if (request.headers?.["Content-Type"] === "application/x-www-form-urlencoded")
				body = new URLSearchParams(Object.entries(request.body)).toString();
			else if (request.headers?.["Content-Type"] === undefined || request.headers?.["Content-Type"] === "application/json") {
				request.headers ??= {};
				request.headers["Content-Type"] = "application/json";
				body = JSON.stringify(request.body);
			}
		}

		let search = "";
		if (request.search) {
			search = "?";
			if (typeof request.search === "object")
				search += new URLSearchParams(Object.entries(request.search)).toString();
			else
				search += request.search;
		}

		const params = [`${path}${search}`, {
			...request,
			body,
			headers: Object.fromEntries(Object.entries(await this.getHeaders(request?.headers, ...args)).filter(([key, value]) => typeof value === "string") as [string, string][]),
		} satisfies RequestInit] as const;
		return fetch(...params);
	}

	protected resolvePath (...args: ARGS) {
		return typeof this.path === "string" ? this.path : this.path(...args);
	}

	protected getDefaultRequest (...args: ARGS): EndpointRequest {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async getHeaders (headers?: Record<string, string | undefined>, ...args: ARGS): Promise<Record<string, string | undefined>> {
		return { ...headers };
	}
}
