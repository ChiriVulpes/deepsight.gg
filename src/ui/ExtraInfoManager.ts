import UiEventBus from "ui/UiEventBus";
import Store from "utility/Store";

class ExtraInfoManager {

	public constructor () {
		UiEventBus.subscribe("keydown", event => {
			if (event.use("e"))
				if (Store.items.settingsToggleExtra)
					this.toggle("KEY");
				else
					this.enable("KEY");
		});
		UiEventBus.subscribe("keyup", event => {
			if (!Store.items.settingsToggleExtra && event.use("e"))
				this.disable("KEY");
		});

		if (Store.items.settingsAlwaysShowExtra)
			document.documentElement.classList.add("show-extra-info");

		Store.event.subscribe("setSettingsAlwaysShowExtra", ({ value }) => this.update());
	}

	private enablers = new Set<string>();
	private enable (id: string) {
		this.enablers.add(id);
		this.update();
		document.documentElement.classList.toggle("show-extra-info", !Store.items.settingsAlwaysShowExtra);
	}

	private disable (id: string) {
		this.enablers.delete(id);
		if (!this.enablers.size)
			this.update();
	}

	private update () {
		document.documentElement.classList.toggle("show-extra-info", !!Store.items.settingsAlwaysShowExtra === !this.enablers.size);
	}

	private toggle (id: string, newState = !this.enablers.has(id)) {
		if (newState)
			this.enable(id);
		else
			this.disable(id);
	}
}

export default new ExtraInfoManager;
