namespace ElementTypes {
	export const COLOURS = {
		arc: 0x7aecf3,
		solar: 0xf0631e,
		void: 0xb185df,
		stasis: 0x4d88ff,
	};

	export function getColour (element?: string): `#${string}` | undefined {
		return COLOURS[element as keyof typeof COLOURS]
			?.toString(16)
			.padStart(6, "0")
			.padStart(7, "#") as `#${string}`;
	}
}

export default ElementTypes;
