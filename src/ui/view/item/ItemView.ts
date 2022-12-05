import InventoryModel from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { BucketId } from "model/models/items/Item";
import Card from "ui/Card";
import Component from "ui/Component";
import { ButtonClasses } from "ui/form/Button";
import ItemComponent from "ui/inventory/Item";
import LoadingManager from "ui/LoadingManager";
import View from "ui/View";

enum ItemViewClasses {
	Item = "view-item-header-item",
	FlavourText = "view-item-flavour-text",
	PerksModsTraits = "view-item-perks-mods-traits",
	Stats = "view-item-stats",
}

export default View.create({
	models: [InventoryModel.createTemporary()],
	id: "item",
	hash: (item: Item | string) => typeof item === "string" ? `item/${item}` : `item/${item.bucket}/${item.id}`,
	name: (item: Item | string) => typeof item === "string" ? "Inspect Item" : item.definition.displayProperties.name,
	noDestinationButton: true,
	initialise: (view, inventory) => {
		LoadingManager.end(view.definition.id);

		let [, itemArg] = view._args as [any, Item | string | undefined];
		if (typeof itemArg === "string") {
			const [bucketId, itemId] = itemArg.split("/") as [BucketId, string];
			itemArg = inventory.buckets[bucketId].items.find(item => item.id === itemId);
		}

		if (!itemArg)
			return;

		const item = itemArg;
		view._args[1] = item;

		view.setTitle(title => title.text.set(item.definition.displayProperties.name))
			.setSubtitle(subtitle => subtitle.text.set(item.definition.itemTypeDisplayName))
			.tweak(view => view.header
				.prepend(ItemComponent.create([item])
					.classes.remove(ButtonClasses.Main)
					.classes.add(ItemViewClasses.Item)
					.clearTooltip())
				.append(Component.create("p")
					.classes.add(ItemViewClasses.FlavourText)
					.text.set(item.definition.flavorText)))
			.tweak(view => view.content
				.append(Component.create()
					.classes.add(ItemViewClasses.PerksModsTraits)
					.append(Card.create()
						.tweak(card => card.title.text.set("Weapon Perks"))
						.append())
					.append(Card.create()
						.tweak(card => card.title.text.set("Weapon Mods"))
						.append())
					.append(Card.create()
						.tweak(card => card.title.text.set("Intrinsic Traits"))
						.append()))
				.append(Component.create()
					.classes.add(ItemViewClasses.Stats)));
	},
});
