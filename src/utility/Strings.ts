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

	export function trimTextMatchingFromStart (string: string, substring: string, startAt?: number) {
		if (string.length < substring.length)
			return string;

		const index = string.indexOf(substring, startAt);
		if (index !== 0)
			return string;

		return string.slice(index + substring.length);
	}

	export function trimTextMatchingFromEnd (string: string, substring: string, startAt?: number) {
		if (string.length < substring.length)
			return string;

		const index = string.lastIndexOf(substring, startAt);
		if (index !== string.length - substring.length)
			return string;

		return string.slice(0, index);
	}

	export function extractFromQuotes (string?: string | null) {
		let substring = (string ?? "").trim();
		if (substring[0] === '"')
			substring = substring.slice(1);
		if (substring[substring.length - 1] === '"')
			substring = substring.slice(0, -1);

		return substring.trim();
	}

	export function extractFromSquareBrackets (string?: string | null) {
		let substring = (string ?? "");
		if (substring[0] === "[")
			substring = substring.slice(1).trimStart();
		if (substring[substring.length - 1] === "]")
			substring = substring.slice(0, -1).trimEnd();

		return substring;
	}

	export function mergeRegularExpressions (flags: string, ...expressions: RegExp[]) {
		let exprString = "";
		for (const expr of expressions)
			exprString += "|" + expr.source;

		return new RegExp(exprString.slice(1), flags);
	}
}

export default Strings;
