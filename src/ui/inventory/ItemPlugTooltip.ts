import type { Perk, Plug } from "model/models/items/Plugs";
import { PlugType } from "model/models/items/Plugs";
import Manifest from "model/models/Manifest";
import Display from "ui/bungie/DisplayProperties";
import Component from "ui/Component";
import TooltipManager, { Tooltip } from "ui/TooltipManager";

enum ItemPlugTooltipClasses {
	Main = "item-plug-tooltip",
	Content = "item-plug-tooltip-content",
	Description = "item-plug-tooltip-description",
	Perk = "item-plug-tooltip-perk",
}

class ItemPlugTooltip extends Tooltip {

	public plug?: Plug;
	public perk?: Perk;

	public description!: Component;

	protected override onMake () {
		this.classes.add(ItemPlugTooltipClasses.Main);
		this.content.classes.add(ItemPlugTooltipClasses.Content);

		this.description = Component.create()
			.classes.add(ItemPlugTooltipClasses.Description)
			.appendTo(this.content);
	}

	public async setPlug (plug: Plug, perk?: Perk) {
		this.plug = plug;
		this.perk = perk;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).plug = plug;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).perk = perk;
		console.log(Display.name(perk?.definition) ?? Display.name(plug.definition), plug, perk);

		// eslint-disable-next-line no-empty-pattern
		const { } = await Manifest.await();

		this.title.text.set(Display.name(perk?.definition) ?? Display.name(plug.definition));
		this.subtitle.removeContents();

		this.subtitle.text.set(plug.type & PlugType.Catalyst ? "Catalyst Perk" : plug.definition?.itemTypeDisplayName ?? "Unknown");
		this.description.text.set(Display.description(perk?.definition) ?? Display.description(plug.definition));

		this.header.classes.toggle(ItemPlugTooltipClasses.Perk);
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemPlugTooltip));
