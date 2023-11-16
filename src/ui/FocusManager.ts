import { EventManager } from "utility/EventManager";
import Bound from "utility/decorator/Bound";

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
		window.addEventListener("focus", this.onPageFocus);
		window.addEventListener("blur", this.onPageBlur);
	}

	@Bound
	private onPageFocus () {
		this._focused = true;
		document.documentElement.classList.add("focused");
		this.event.emit("focus");
		this.event.emit("changeFocusState", { focused: this.focused });
	}

	@Bound
	private onPageBlur () {
		this._focused = false;
		document.documentElement.classList.remove("focused");
		this.event.emit("changeFocusState", { focused: this.focused });
	}
}

const FocusManager = new FocusManagerImpl();
type FocusManager = FocusManagerImpl;
export default FocusManager;
