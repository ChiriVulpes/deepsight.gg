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
}

export default Strings;
