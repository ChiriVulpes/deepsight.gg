declare global {
	interface DOMRect {
		centerX: number;
		centerY: number;
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
}
