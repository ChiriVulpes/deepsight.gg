import Define from "utility/Define"

declare global {
	interface String {
		trimQuotes (): string
	}
}

namespace Strings {
	export function applyPrototypes () {
		Define(String.prototype, 'trimQuotes', function (this: String) {
			if (this[0] === '"' && this[this.length - 1] === '"')
				return this.slice(1, -1)
			return this.slice()
		})
	}
}

export default Strings
