import type { Item } from "model/models/Items";
import Manifest from "model/models/Manifest";
import TooltipManager, { Tooltip } from "ui/TooltipManager";

enum ItemTooltipClasses {
	Main = "item-tooltip",
	Tag = "item-tooltip-tag",
}

class ItemTooltip extends Tooltip {
	protected override onMake () {
		this.classes.add(ItemTooltipClasses.Main);
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
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemTooltip));