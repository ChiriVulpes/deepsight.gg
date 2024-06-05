interface BungieID {
	name: string;
	code: number;
}

namespace BungieID {
	export type String = `${string}#${number}`;
	export function stringify (id: BungieID): string;
	export function stringify (id?: BungieID): string | undefined
	export function stringify (id?: BungieID) {
		return !id ? undefined : `${id.name}#${`${id.code}`.padStart(4, "0")}`;
	}

	export function parse (string: string, encoded = false): BungieID | undefined {
		let name = string.slice(0, -5);
		if (encoded)
			name = decodeURIComponent(name);

		const code = string.slice(-4);
		if (isNaN(parseInt(code)))
			return undefined;

		return { name, code: +code };
	}
}

export default BungieID;
