import Endpoint from "utility/endpoint/Endpoint";

export default class ClarityEndpoint<T, R = T> extends Endpoint<T, R> {
	public constructor (path: string, init?: Partial<ClarityEndpoint<T, R>>) {
		super(path);
		Object.assign(this, init);
	}

	protected override resolvePath (): string {
		return `https://database-clarity.github.io/Live-Clarity-Database/${super.resolvePath()}`;
	}
}
