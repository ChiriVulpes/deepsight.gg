import BungieID from "utility/BungieID";
import { EventManager } from "utility/EventManager";
import Store from "utility/Store";

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

export interface IURLEvents {
	navigate: Event;
}

let poppingState = false;
EventManager.global.subscribe("popstate", () => {
	poppingState = true;
	URL.event.emit("navigate");
	poppingState = false;
});

export default class URL {

	public static readonly event = EventManager.make<IURLEvents>();

	public static get hash () {
		return location.hash.slice(1);
	}

	public static set hash (value: string | null) {
		if (!poppingState)
			history.pushState(null, "", `${location.origin}${location.pathname}${location.search}${value ? `#${value}` : ""}`);
	}

	public static get path () {
		let path = location.pathname.slice(1);
		if (!path.endsWith("/"))
			path += "/";

		if (path.startsWith("beta/"))
			path = path.slice(5);

		const bungieId = URL.extractBungieId(path);
		if (bungieId)
			path = path.slice(`${encodeURIComponent(bungieId.name)}.${`${bungieId.code}`.padStart(4, "0")}`.length + 1);

		return !path || path === "/" ? null : path;
	}

	public static set path (value: string | null) {
		if (value && !value?.startsWith("/"))
			value = `/${value}`;

		const membershipOverride = Store.items.selectedProfile;
		const membershipOverrideSegment = !membershipOverride ? "" : encodeURIComponent(membershipOverride.replace("#", "."));
		if (value && membershipOverrideSegment)
			value = `/${membershipOverrideSegment}${value}`;

		if (value && location.pathname.startsWith("/beta/"))
			value = `/beta${value}`;

		if (value?.endsWith("/"))
			value = value.slice(0, -1);

		value ||= "/";

		if (location.pathname === value)
			return;

		if (!poppingState)
			history.pushState(null, "", `${location.origin}${value}${location.search}`);
	}

	private static extractBungieId (path: string) {
		const nextSlashIndex = path.indexOfOrUndefined("/");
		if (nextSlashIndex === undefined)
			return undefined;

		const segment = path.slice(0, nextSlashIndex);
		if (segment[segment.length - 5] !== ".")
			return undefined;

		return BungieID.parse(segment as BungieID.String, true);
	}

	public static get bungieID (): BungieID | undefined {
		let path = location.pathname.slice(1);
		if (!path.endsWith("/"))
			path += "/";

		if (path.startsWith("beta/"))
			path = path.slice(5);

		const bungieId = URL.extractBungieId(path);
		if (!bungieId)
			return undefined;

		const name = bungieId.name;
		const code = +bungieId.code;

		const membershipOverride = Store.items.selectedProfile;
		if (membershipOverride && membershipOverride !== BungieID.stringify(bungieId))
			delete Store.items.selectedProfile;

		return { name, code };
	}

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