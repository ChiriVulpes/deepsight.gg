import type { Item } from "model/models/Items";
import Manifest from "model/models/Manifest";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import TooltipManager, { Tooltip } from "ui/TooltipManager";

enum ItemTooltipClasses {
	Main = "item-tooltip",
	Tag = "item-tooltip-tag",
	SourceWatermark = "item-tooltip-source-watermark",
}

class ItemTooltip extends Tooltip {

	public source!: Component;

	protected override onMake () {
		this.classes.add(ItemTooltipClasses.Main);
		this.source = Component.create()
			.classes.add(ItemTooltipClasses.SourceWatermark, Classes.Hidden)
			.appendTo(this.header);
	}

	public async setItem (item: Item) {
		const { DestinyItemTierTypeDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.remove(...this.classes.all().filter(cls => cls.startsWith("item-tooltip-tier-")));
		this.classes.add(`item-tooltip-tier-${(tier?.displayProperties.name ?? "Common")?.toLowerCase()}`);

		this.title.text.set(item.definition.displayProperties.name);
		this.subtitle.removeContents();

		this.subtitle.text.set(item.definition.itemTypeDisplayName);
		this.extra.text.set(item.definition.inventory?.tierTypeName);

		this.source.classes.toggle(!item.source?.displayProperties.icon, Classes.Hidden);
		if (item.source?.displayProperties.icon)
			this.source.style.set("--icon", `url("${item.source.displayProperties.icon}")`);
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemTooltip));