import Define from "utility/Define";

declare global {
	interface String {
		indexOfOrUndefined (substring: string, startAt?: number): number | undefined;
		lastIndexOfOrUndefined (substring: string, startAt?: number): number | undefined;
	}
}

export default function applyPrototypes () {
	Define(String.prototype, "indexOfOrUndefined", function (substring, startAt) {
		const index = this.indexOf(substring, startAt);
		return index === -1 ? undefined : index;
	});

	Define(String.prototype, "lastIndexOfOrUndefined", function (substring, startAt) {
		const index = this.lastIndexOf(substring, startAt);
		return index === -1 ? undefined : index;
	});
}