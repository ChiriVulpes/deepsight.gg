import type { Item } from "model/models/Items";
import Manifest from "model/models/Manifest";
import Button from "ui/Button";
import Component from "ui/Component";

export enum ItemClasses {
	Main = "item",
	Icon = "item-icon",
}

export default class ItemComponent extends Button<[Item]> {

	public item!: Item;

	protected override async onMake (item: Item) {
		super.onMake(item);

		this.item = item;

		this.classes.add(ItemClasses.Main);
		const { DestinyItemTierTypeDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.add(`item-tier-${(tier?.displayProperties.name ?? "Common")?.toLowerCase()}`);

		Component.create()
			.classes.add(ItemClasses.Icon)
			.style.set("--icon", `url("https://www.bungie.net${item.definition.displayProperties.icon}")`)
			.appendTo(this);

		// this.text.set(item.definition.displayProperties.name);
	}
}
