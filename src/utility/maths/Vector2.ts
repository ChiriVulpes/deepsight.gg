export interface IVector2 {
	x: number;
	y: number;
}

export namespace IVector2 {
	export function ZERO (): IVector2 {
		return { x: 0, y: 0 };
	}

	export function distance (v1: IVector2, v2: IVector2) {
		return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
	}

	export function distanceWithin (v1: IVector2, v2: IVector2, within: number) {
		return (v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2 < within ** 2;
	}
}
