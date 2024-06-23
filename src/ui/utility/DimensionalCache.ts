import Bound from "utility/decorator/Bound";

export default class DimensionalCache {

	private static readonly map = new WeakMap<HTMLElement, DimensionalCache>();

	public static get (element: HTMLElement) {
		let cache = DimensionalCache.map.get(element);
		if (!cache) {
			cache = new DimensionalCache(element);
			DimensionalCache.map.set(element, cache);
		}

		return cache;
	}

	private readonly element: WeakRef<HTMLElement>;
	private readonly cleanupInterval = window.setInterval(this.tryCleanup, 1000);

	public constructor (element: HTMLElement) {
		this.element = new WeakRef(element);
		window.addEventListener("resize", this.reset);

	}

	@Bound private tryCleanup () {
		if (this.element.deref())
			return;

		window.removeEventListener("resize", this.reset);
		window.clearInterval(this.cleanupInterval);
	}

	@Bound public reset () {
		this.tryCleanup();

		delete this._width;
		delete this._height;
		delete this._top;
		delete this._left;
		delete this._bottom;
		delete this._right;
		delete this._scrollWidth;
		delete this._scrollHeight;
		delete this._scrollTop;
		delete this._scrollLeft;
		delete this._scrollBottom;
		delete this._scrollRight;
	}

	private _width?: number;
	public get width () {
		return this._width ??= this.element.deref()?.clientWidth ?? 0;
	}

	private _height?: number;
	public get height () {
		return this._height ??= this.element.deref()?.clientHeight ?? 0;
	}

	private _top?: number;
	public get top () {
		return this._top ??= this.element.deref()?.clientTop ?? 0;
	}

	private _left?: number;
	public get left () {
		return this._left ??= this.element.deref()?.clientLeft ?? 0;
	}

	private _bottom?: number;
	public get bottom () {
		return this._bottom ??= this.top + this.height;
	}

	private _right?: number;
	public get right () {
		return this._right ??= this.left + this.width;
	}

	private _scrollWidth?: number;
	public get scrollWidth () {
		return this._scrollWidth ??= this.element.deref()?.scrollWidth ?? 0;
	}

	private _scrollHeight?: number;
	public get scrollHeight () {
		return this._scrollHeight ??= this.element.deref()?.scrollHeight ?? 0;
	}

	private _scrollTop?: number;
	public get scrollTop () {
		return this._scrollTop ??= this.element.deref()?.scrollTop ?? 0;
	}

	private _scrollLeft?: number;
	public get scrollLeft () {
		return this._scrollLeft ??= this.element.deref()?.scrollLeft ?? 0;
	}

	private _scrollBottom?: number;
	public get scrollBottom () {
		return this._scrollBottom ??= this.scrollTop + this.height;
	}

	private _scrollRight?: number;
	public get scrollRight () {
		return this._scrollRight ??= this.scrollLeft + this.width;
	}

}
