import type { Loadout } from "model/models/Loadouts";
import Component from "ui/component/Component";
import TooltipManager, { Tooltip } from "ui/utility/TooltipManager";

export enum LoadoutTooltipClasses {
	Main = "loadout-tooltip",
}

class LoadoutTooltip extends Tooltip {

	public loadout?: Loadout;

	protected override onMake (): void {
		this.classes.add(LoadoutTooltipClasses.Main);
		this.subtitle.text.set("Loadout");
		this.content.append(Component.create().text.set("This feature is a work-in-progress. Stay tuned!"));
	}

	public set (loadout?: Loadout) {
		Object.assign(window, { loadout });
		console.log(loadout?.isEmpty() ? "Empty" : loadout?.name?.name ?? "Unknown", loadout);

		this.loadout = loadout;
		this.title.text.set(!loadout ? "Unknown Loadout" : loadout.name?.name ?? "Save New Loadout");
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(LoadoutTooltip));
