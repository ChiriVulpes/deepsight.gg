import TypeScriptParser from "utility/overcomplicated/TypeScriptParser";

export default class d2aiEndpoint<T> {
	public constructor (private readonly path: string) { }

	public async query (): Promise<T> {
		return fetch(`https://raw.githubusercontent.com/DestinyItemManager/d2ai-module/master/${this.path}`)
			.then(response => response.text())
			.then(text => {
				if (this.path.endsWith(".json")) {
					return JSON.parse(text) as T;
				} else if (this.path.endsWith(".ts")) {
					return TypeScriptParser.parse(text) as T;
				}

				throw new Error("Unknown file type");
			});
	}
}
