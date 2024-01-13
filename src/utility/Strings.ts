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

	export function count (string: string, substring: string, stopAtCount = Infinity) {
		let count = 0;
		let lastIndex = -1;
		while (count < stopAtCount) {
			const index = string.indexOf(substring, lastIndex + 1);
			if (index === -1)
				return count;

			count++;
			lastIndex = index;
		}

		return count;
	}

	export function includesOnce (string: string, substring: string) {
		return count(string, substring, 2) === 1;
	}

	export function getVariations (name: string) {
		const variations = [name];
		variations.push(name + "d", name + "ed");

		if (name.endsWith("d"))
			variations.push(...getVariations(name.slice(0, -1)));

		if (name.endsWith("ed"))
			variations.push(...getVariations(name.slice(0, -2)));

		if (name.endsWith("ing")) {
			variations.push(name.slice(0, -3));
			if (name[name.length - 4] === name[name.length - 5])
				variations.push(name.slice(0, -4));
		} else {
			variations.push(name + "ing", name + name[name.length - 1] + "ing");
			if (name.endsWith("y"))
				variations.push(name.slice(0, -1) + "ing");
		}

		if (name.endsWith("ion")) {
			variations.push(...getVariations(name.slice(0, -3)));
			if (name[name.length - 4] === name[name.length - 5])
				variations.push(name.slice(0, -4));
		} else
			variations.push(name + "ion");

		if (name.endsWith("er"))
			variations.push(name.slice(0, -1), name.slice(0, -2));
		else {
			variations.push(name + "r", name + "er");
			if (name.endsWith("y"))
				variations.push(name.slice(0, -1) + "ier");
		}

		if (name.endsWith("ier"))
			variations.push(name.slice(0, -3) + "y");

		variations.push(name + "s", name + "es");
		if (name.endsWith("s"))
			variations.push(name.slice(0, -1));
		else {
			if (name.endsWith("y"))
				variations.push(name.slice(0, -1) + "ies");
		}

		return variations;
	}

	const REGEX_APOSTROPHE = /'/g;
	const REGEX_NON_WORD_MULTI = /\W+/g;
	export function getWords (text: string) {
		return text.toLowerCase()
			.replace(REGEX_APOSTROPHE, "")
			.split(REGEX_NON_WORD_MULTI)
			.filter(Boolean);
	}

	export interface FuzzyMatchOptions {
		/** 
		 * A number between 0 and 1 representing the fractional threshold of number of matching words vs missing words.
		 * Defaults to `0.4`
		 */
		missingWordsThreshold?: number;
		/**
		 * The number of words that can be missing between two fuzzy matched sections of text.
		 * Defaults to `4`
		 */
		maxMissingWordsForFuzzy?: number;
	}

	export function fuzzyMatches (a: string, b: string, options?: FuzzyMatchOptions) {
		options ??= {};
		options.missingWordsThreshold ??= 0.4;
		options.maxMissingWordsForFuzzy = 4;

		const wordsA = getWords(a).map(getVariations);
		const wordsB = getWords(b).map(getVariations);

		let matches = 0;
		let misses = 0;
		let ia = 0;
		let ib = 0;
		NextMain: while (true) {
			const va = wordsA[ia] as string[] | undefined;
			const vb = wordsB[ib] as string[] | undefined;
			if (!va && !vb)
				break;

			if (!va || !vb) {
				ia++;
				ib++;
				misses++;
				continue;
			}

			let loopMisses = 0;
			for (let ia2 = ia; ia2 < wordsA.length && loopMisses <= options.maxMissingWordsForFuzzy; ia2++) {
				const va = wordsA[ia2];
				if (va.some(va => vb.includes(va))) {
					ia = ia2 + 1;
					ib++;
					matches++;
					misses += loopMisses;
					continue NextMain;
				}

				loopMisses++;
			}

			loopMisses = 0;
			for (let ib2 = ib; ib2 < wordsB.length && loopMisses <= options.maxMissingWordsForFuzzy; ib2++) {
				const vb = wordsB[ib2];
				if (vb.some(vb => va.includes(vb))) {
					ia++;
					ib = ib2 + 1;
					matches++;
					misses += loopMisses;
					continue NextMain;
				}

				loopMisses++;
			}

			misses++;
			ia++;
			ib++;
		}

		return matches / (matches + misses) >= options.missingWordsThreshold;
	}

	const REGEX_NON_WORD_MULTI_PREV = /(?<=\W+)/g;
	export function toTitleCase (text: string) {
		return text.split(REGEX_NON_WORD_MULTI_PREV)
			.map(word => word[0].toUpperCase() + word.slice(1))
			.join("");
	}
}

export default Strings;
