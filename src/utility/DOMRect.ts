import Define from "utility/Define";

declare global {
	interface DOMRect {
		centerX: number;
		centerY: number;
		containsPoint (x: number, y: number): boolean;
	}
}

export default function () {
	Object.defineProperty(DOMRect.prototype, "centerX", {
		get (this: DOMRect) {
			return this.left + this.width / 2;
		},
	});

	Object.defineProperty(DOMRect.prototype, "centerY", {
		get (this: DOMRect) {
			return this.top + this.height / 2;
		},
	});

	Define(DOMRect.prototype, "containsPoint", function (x, y) {
		return x >= this.x && x < this.x + this.width
			&& y >= this.y && y < this.y + this.height;
	});
}
