import Component from "ui/component/Component";
import { EventManager } from "utility/EventManager";
import Bound from "utility/decorator/Bound";

export interface IFocusManagerEvents {
	focus: Event;
	blur: Event;
	changeFocusState: { focused: boolean };
	mouseenter: Event;
	mouseleave: Event;
	changeHoverState: { hovered: boolean };
	active: Event;
	inactive: Event;
	changeActiveState: { active: boolean };
}

class FocusManagerImpl {

	public readonly event = EventManager.make<IFocusManagerEvents>();
	private _focused = false;
	private _hovered = false;

	public get focused () {
		return this._focused;
	}

	public get hovered () {
		return this._focused;
	}

	public get active () {
		return this._focused || this._hovered;
	}

	public constructor () {
		this.onPageFocus();
		window.addEventListener("focus", this.onPageFocus);
		window.addEventListener("blur", this.onPageBlur);
		window.addEventListener("mouseover", this.onPageMouseEnter);
		window.addEventListener("mouseout", this.onPageMouseLeave);
	}

	@Bound
	private onPageFocus () {
		if (this._focused)
			return;

		this._focused = true;
		document.documentElement.classList.add("focused");
		this.event.emit("focus");
		this.event.emit("changeFocusState", { focused: true });

		if (!this._hovered) {
			document.documentElement.classList.remove("inactive");
			document.documentElement.classList.add("active");
			this.event.emit("active");
			this.event.emit("changeActiveState", { active: true });
		}
	}

	@Bound
	private onPageBlur () {
		if (!this._focused)
			return;

		this._focused = false;
		document.documentElement.classList.remove("focused");
		this.event.emit("blur");
		this.event.emit("changeFocusState", { focused: false });

		if (!this._hovered) {
			document.documentElement.classList.remove("active");
			document.documentElement.classList.add("inactive");
			this.event.emit("inactive");
			this.event.emit("changeActiveState", { active: false });
		}
	}

	@Bound
	private onPageMouseEnter () {
		if (this._hovered)
			return;

		this._hovered = true;
		document.documentElement.classList.add("hovered");
		this.event.emit("mouseenter");
		this.event.emit("changeHoverState", { hovered: true });

		if (!this._focused) {
			document.documentElement.classList.remove("inactive");
			document.documentElement.classList.add("active");
			this.event.emit("active");
			this.event.emit("changeActiveState", { active: true });
		}
	}

	@Bound
	private onPageMouseLeave (event: MouseEvent) {
		if (!this._hovered)
			return;

		const outside = event.clientX < 0 || event.clientX > Component.window.width
			|| event.clientY < 0 || event.clientY > Component.window.height;
		if (!outside)
			return;

		this._hovered = false;
		document.documentElement.classList.remove("hovered");
		this.event.emit("mouseleave");
		this.event.emit("changeHoverState", { hovered: false });

		if (!this._focused) {
			document.documentElement.classList.remove("active");
			document.documentElement.classList.add("inactive");
			this.event.emit("inactive");
			this.event.emit("changeActiveState", { active: false });
		}
	}
}

const FocusManager = new FocusManagerImpl();
type FocusManager = FocusManagerImpl;
export default FocusManager;
