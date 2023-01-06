namespace Strings {
	export function includesAt (string: string, substring: string, index: number) {
		if (index < 0)
			index = string.length + index;

		if (index + substring.length > string.length)
			return false;

		for (let i = 0; i < substring.length; i++)
			if (string[i + index] !== substring[i])
				return false;

		return true;
	}

	export function sliceTo (string: string, substring: string, startAt?: number) {
		const index = string.indexOf(substring, startAt);
		if (index === -1)
			return string;

		return string.slice(0, index);
	}

	export function sliceAfter (string: string, substring: string, startAt?: number) {
		const index = string.indexOf(substring, startAt);
		if (index === -1)
			return string;

		return string.slice(index + substring.length);
	}

	export function extractFromQuotes (string?: string | null) {
		let substring = (string ?? "").trim();
		if (substring[0] === '"')
			substring = substring.slice(1);
		if (substring[substring.length - 1] === '"')
			substring = substring.slice(0, -1);

		return substring.trim();
	}
}

export default Strings;
