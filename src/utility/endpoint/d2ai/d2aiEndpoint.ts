import Endpoint from "utility/endpoint/Endpoint";

export default class d2aiEndpoint<T> extends Endpoint<T> {
	public constructor (path: string) {
		super(`https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/${path}`);
	}
}
