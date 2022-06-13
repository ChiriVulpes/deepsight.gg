import Endpoint from "utility/endpoint/Endpoint";

export default class FVMEndpoint<T> extends Endpoint<T> {
	public constructor (path: string) {
		super(`/manifest/${path}`);
	}
}
