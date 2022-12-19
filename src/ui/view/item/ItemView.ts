import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Inventory from "model/models/Inventory";
import type { BucketId } from "model/models/items/Item";
import Item from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import Component from "ui/Component";
import Button, { ButtonClasses } from "ui/form/Button";
import ItemComponent from "ui/inventory/Item";
import LoadingManager from "ui/LoadingManager";
import View from "ui/View";
import ItemIntrinsics from "ui/view/item/ItemIntrinsics";
import ItemPerks from "ui/view/item/ItemPerks";

export async function resolveItemURL (url: string) {
	const manifest = await Manifest.await();
	const profile = await Profile(DestinyComponentType.Records).await();
	const inventory = await Inventory.createTemporary().await();
	const { DestinyInventoryItemDefinition } = manifest;

	const [bucketId, itemId] = url.split("/") as [BucketId, string];
	if (bucketId !== "collections")
		return inventory.buckets?.[bucketId]?.items.find(item => item.id === itemId);

	const hash = itemId.slice(5);
	const itemDef = await DestinyInventoryItemDefinition.get(hash);
	if (!itemDef)
		return;

	return Item.createFake(manifest, profile, itemDef);
}

enum ItemViewClasses {
	Item = "view-item-header-item",
	ItemDefinition = "view-item-definition",
	FlavourText = "view-item-flavour-text",
	PerksModsTraits = "view-item-perks-mods-traits",
	Stats = "view-item-stats",
	ButtonViewInCollections = "view-item-button-view-in-collections",
	ButtonWishlistPerks = "view-item-button-wishlist-perks",
}

const ItemView = View.create({
	models: (item: Item | string) => typeof item !== "string" ? [] : [Model.createTemporary(async () =>
		resolveItemURL(item))],
	id: "item",
	hash: (item: Item | string) => typeof item === "string" ? `item/${item}` : `item/${item.bucket}/${item.id}`,
	name: (item: Item | string) => typeof item === "string" ? "Inspect Item" : item.definition.displayProperties.name,
	noDestinationButton: true,
	initialise: (view, itemModel) => {
		LoadingManager.end(view.definition.id);

		const item = view._args[1] = itemModel ?? view._args[1]! as Item;

		console.log(item.definition.displayProperties.name, item);

		function viewInCollections () {
			ItemView.show(`collections/hash:${item.definition.hash}`);
		}

		view.classes.toggle(!item.instance, ItemViewClasses.ItemDefinition)
			.setTitle(title => title.text.set(item.definition.displayProperties.name))
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
					.append(ItemPerks.create([item])
						.tweak(perks => !item.instance ? undefined : perks.title
							.append(Button.create()
								.classes.add(ItemViewClasses.ButtonWishlistPerks)
								.text.set("Wishlist Perks")
								.event.subscribe("click", viewInCollections))))
					// .append(ItemMods.create([item]))
					.append(ItemIntrinsics.create([item])))
				.append(Component.create()
					.classes.add(ItemViewClasses.Stats)));

		if (item.instance)
			Button.create()
				.classes.add(ItemViewClasses.ButtonViewInCollections)
				.text.set("View in Collections")
				.event.subscribe("click", viewInCollections)
				.appendTo(view.header);
	},
});

export default ItemView;
