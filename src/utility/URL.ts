export interface IURLParams {
	update (): void;

	code?: string;
	state?: string;
}

let params: IURLParams | undefined;
let query: URLSearchParams | undefined;
function updateURL () {
	let queryString = query!.toString();
	if (queryString)
		queryString = `?${queryString}`;
	history.replaceState(null, "", `${location.origin}${location.pathname}${queryString}${location.hash}`);
}

export default class URL {
	public static get params () {
		return params ??= new Proxy(query ??= new URLSearchParams(location.search), {
			has (params, key) {
				return params.has(key as string);
			},
			get (params, key) {
				return params.get(key as string);
			},
			set (params, key, value) {
				params.set(key as string, value as string);
				updateURL();
				return true;
			},
			deleteProperty (params, key) {
				params.delete(key as string);
				updateURL();
				return true;
			},
		}) as any as IURLParams;
	}
}