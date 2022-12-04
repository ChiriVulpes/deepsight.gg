import Endpoint from "utility/endpoint/Endpoint";

export default class FVMEndpoint<T, R = T> extends Endpoint<T, R> {
	public constructor (path: string, init?: Partial<FVMEndpoint<T, R>>) {
		super(`/manifest/${path}`);
		Object.assign(this, init);
	}
}
