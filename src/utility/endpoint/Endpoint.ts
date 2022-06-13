import TypeScriptParser from "utility/overcomplicated/TypeScriptParser";

export interface EndpointRequest extends Omit<RequestInit, "headers" | "body"> {
	headers?: Record<string, string | undefined>;
	body?: string | object;
	search?: string | object;
}

export default class Endpoint<T, ARGS extends any[] = []> {
	public constructor (protected readonly path: string | ((...args: ARGS) => string), protected readonly builder?: (...args: ARGS) => EndpointRequest) { }

	public async query (...args: ARGS): Promise<T> {
		const path = this.resolvePath(...args);
		return this.fetch(path, ...args)
			.then(response => response.text())
			.then(text => {
				if (path.endsWith(".json")) {
					return JSON.parse(text) as T;
				} else if (path.endsWith(".ts")) {
					return TypeScriptParser.parse(text) as T;
				}

				throw new Error("Unknown file type");
			});
	}

	protected async fetch (path: string | undefined, ...args: ARGS) {
		path ??= this.resolvePath(...args);

		const request = {
			...this.getDefaultRequest(...args),
			...this.builder?.(...args) ?? {},
		};

		let body: string | undefined;
		if (typeof request.body === "object")
			body = new URLSearchParams(Object.entries(request.body)).toString();

		let search = "";
		if (request.search) {
			search = "?";
			if (typeof request.search === "object")
				search += new URLSearchParams(Object.entries(request.search)).toString();
			else
				search += request.search;
		}

		return fetch(`${path}${search}`, {
			...request,
			body,
			headers: Object.fromEntries(Object.entries(await this.getHeaders(request?.headers)).filter(([key, value]) => typeof value === "string") as [string, string][]),
		});
	}

	protected resolvePath (...args: ARGS) {
		return typeof this.path === "string" ? this.path : this.path(...args);
	}

	protected getDefaultRequest (...args: ARGS): EndpointRequest {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async getHeaders (headers?: Record<string, string | undefined>): Promise<Record<string, string | undefined>> {
		return { ...headers };
	}
}