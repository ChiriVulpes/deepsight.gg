import { ItemPerkVisibility } from "bungie-api-ts/destiny2";
import type Item from "model/models/items/Item";
import Component from "ui/Component";
import Display from "ui/bungie/DisplayProperties";

export enum ItemTooltipPerksClasses {
	Main = "item-tooltip-perks",
	Perk = "item-tooltip-perk",
	PerkIcon = "item-tooltip-perk-icon",
	PerkDisabled = "item-tooltip-perk-disabled",
	PerkDescription = "item-tooltip-perk-description",
}

export default class ItemTooltipPerks extends Component {
	protected override onMake (): void {
		this.classes.add(ItemTooltipPerksClasses.Main);
	}

	public setItem (item: Item) {
		this.removeContents();

		for (const perk of item.perks ?? []) {
			if (!perk.definition.isDisplayable)
				continue;

			if (perk.reference ? !perk.reference.visible : perk.perkVisibility === ItemPerkVisibility.Hidden)
				continue;

			Component.create()
				.classes.add(ItemTooltipPerksClasses.Perk)
				.classes.toggle(perk.perkVisibility === ItemPerkVisibility.Disabled, ItemTooltipPerksClasses.PerkDisabled)
				.append(Component.create()
					.classes.add(ItemTooltipPerksClasses.PerkIcon)
					.style.set("--icon", Display.icon(perk.definition)))
				.append(Component.create()
					.classes.add(ItemTooltipPerksClasses.PerkDescription)
					.tweak(Display.applyDescription, Display.description(perk.definition), item.character?.characterId))
				.appendTo(this);
		}
	}
}
