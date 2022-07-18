import { EventManager } from "utility/EventManager";

export interface IFocusManagerEvents {
	focus: Event;
	blur: Event;
	changeFocusState: { focused: boolean };
}

class FocusManagerImpl {

	public readonly event = EventManager.make<IFocusManagerEvents>();
	private _focused = true;

	public get focused () {
		return this._focused;
	}

	public constructor () {
		this.onPageFocus = this.onPageFocus.bind(this);
		this.onPageBlur = this.onPageBlur.bind(this);
		window.addEventListener("focus", this.onPageFocus);
		window.addEventListener("blur", this.onPageBlur);
	}

	private onPageFocus () {
		this._focused = true;
		document.documentElement.classList.add("focused");
		this.event.emit("focus");
		this.event.emit("changeFocusState", { focused: this.focused });
	}

	private onPageBlur () {
		this._focused = false;
		document.documentElement.classList.remove("focused");
		this.event.emit("changeFocusState", { focused: this.focused });
	}
}

const FocusManager = new FocusManagerImpl();
type FocusManager = FocusManagerImpl;
export default FocusManager;
