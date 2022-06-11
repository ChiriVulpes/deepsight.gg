import type { DestinyGeneratedEnums } from "bungie-api-ts/generated-enums";
import type { DestinyEnumHelper } from "model/models/DestinyEnums";
import DestinyEnums from "model/models/DestinyEnums";
import type { Item } from "model/models/Items";
import Manifest from "model/models/Manifest";
import Component from "ui/Component";
import TooltipManager, { Tooltip } from "ui/TooltipManager";

enum ItemTooltipClasses {
	Main = "item-tooltip",
	Tag = "item-tooltip-tag",
}

function getExcludedCategories (ItemCategoryHashes: DestinyEnumHelper<DestinyGeneratedEnums["ItemCategoryHashes"]>) {
	return [
		ItemCategoryHashes.byName("Armor"),
		ItemCategoryHashes.byName("Weapon"),
		ItemCategoryHashes.byName("KineticWeapon"),
		ItemCategoryHashes.byName("EnergyWeapon"),
		ItemCategoryHashes.byName("PowerWeapon"),
	];
}

class ItemTooltip extends Tooltip {
	protected override onMake () {
		this.classes.add(ItemTooltipClasses.Main);
	}

	public async setItem (item: Item) {
		const { DestinyItemCategoryDefinition, DestinyItemTierTypeDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.remove(...this.classes.all().filter(cls => cls.startsWith("item-tooltip-tier-")));
		this.classes.add(`item-tooltip-tier-${(tier?.displayProperties.name ?? "Common")?.toLowerCase()}`);

		const { ItemCategoryHashes } = await DestinyEnums.await();
		const excludedCategories = getExcludedCategories(ItemCategoryHashes);

		this.title.text.set(item.definition.displayProperties.name);
		this.subtitle.removeContents();
		for (const categoryHash of item.definition.itemCategoryHashes ?? []) {
			const category = await DestinyItemCategoryDefinition.get(categoryHash);
			if (category === undefined)
				continue;

			if (excludedCategories.includes(category.hash))
				continue;

			console.log(category);

			Component.create()
				.classes.add(ItemTooltipClasses.Tag)
				.text.set(category.displayProperties.name)
				.appendTo(this.subtitle);
		}
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemTooltip));