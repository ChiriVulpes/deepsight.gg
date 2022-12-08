import Endpoint from "utility/endpoint/Endpoint";

export default class DeepsightEndpoint<T, R = T> extends Endpoint<T, R> {
	public constructor (path: string, init?: Partial<DeepsightEndpoint<T, R>>) {
		super(`/manifest/${path}`);
		Object.assign(this, init);
	}
}
