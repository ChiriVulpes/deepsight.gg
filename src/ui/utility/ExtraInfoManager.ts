import UiEventBus from "ui/utility/UiEventBus";
import Store from "utility/Store";

class ExtraInfoManager {

	public constructor () {
		UiEventBus.subscribe("keydown", event => {
			if (event.use("e"))
				if (Store.items.settingsToggleExtra)
					this.toggleMain("KEY");
				else
					this.enableMain("KEY");
		});
		UiEventBus.subscribe("keyup", event => {
			if (!Store.items.settingsToggleExtra && event.use("e"))
				this.disableMain("KEY");
		});

		if (Store.items.settingsAlwaysShowExtra)
			document.documentElement.classList.add("show-extra-info");

		Store.event.subscribe("setSettingsAlwaysShowExtra", ({ value }) => this.update());
	}

	private enablersMain = new Set<string>();
	private enableMain (id: string) {
		this.enablersMain.add(id);
		this.update();
		document.documentElement.classList.toggle("show-extra-info", !Store.items.settingsAlwaysShowExtra);
	}

	private disableMain (id: string) {
		this.enablersMain.delete(id);
		if (!this.enablersMain.size)
			this.update();
	}

	private toggleMain (id: string, newState = !this.enablersMain.has(id)) {
		if (newState)
			this.enableMain(id);
		else
			this.disableMain(id);
	}

	private shouldShowExtraInfo () {
		return !!Store.items.settingsAlwaysShowExtra === !this.enablersMain.size;
	}

	private update () {
		const extraInfo = this.shouldShowExtraInfo();
		document.documentElement.classList.toggle("show-extra-info", extraInfo);
		document.documentElement.classList.toggle("no-extra-info", !extraInfo);
		for (const [id, enablers] of this.enablers.entries())
			this.updateSubExtraInfo(id, enablers);
	}

	private updateSubExtraInfo (id: string, enablers = this.enablers.get(id)) {
		if (!enablers)
			return;

		const subExtraInfo = this.shouldShowExtraInfo() || !!enablers.size;
		document.documentElement.classList.toggle(`show-${id}-extra-info`, subExtraInfo);
		document.documentElement.classList.toggle(`no-${id}-extra-info`, !subExtraInfo);
	}

	public register (id: string) {
		this.enablers.set(id, new Set());
		this.updateSubExtraInfo(id);
	}

	private enablers = new Map<string, Set<string>>();
	public enable (id: string, reason = "n/a") {
		let enablers = this.enablers.get(id);
		if (!enablers)
			this.enablers.set(id, enablers = new Set());

		const size = enablers.size;
		enablers.add(reason);
		if (size)
			return; // already had enabler

		this.updateSubExtraInfo(id, enablers);
	}

	public disable (id: string, reason = "n/a") {
		const enablers = this.enablers.get(id);
		if (!enablers?.size)
			return;

		enablers.delete(reason);

		if (!enablers.size)
			this.updateSubExtraInfo(id, enablers);
	}

	public toggle (id: string, reason = "n/a", newState = !this.enablers.get(id)?.has(reason)) {
		if (newState)
			this.enable(id, reason);
		else
			this.disable(id, reason);
	}
}

export default new ExtraInfoManager;
