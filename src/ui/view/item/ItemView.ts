import { DestinyComponentType } from "bungie-api-ts/destiny2";
import type { IModelGenerationApi } from "model/Model";
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
import Objects from "utility/Objects";

export async function resolveItemURL (url: string, api: IModelGenerationApi) {
	const manifest = await api.subscribeProgressAndWait(Manifest, 1 / 4);
	const profile = await api.subscribeProgressAndWait(Profile(DestinyComponentType.Records), 1 / 4, 1 / 4);
	const inventory = await api.subscribeProgressAndWait(Inventory.createTemporary(), 1 / 4, 2 / 4);
	const { DestinyInventoryItemDefinition } = manifest;

	const [bucketId, itemId] = url.split("/") as [BucketId, string];
	if (bucketId !== "collections")
		return inventory.buckets?.[bucketId]?.items.find(item => item.id === itemId);

	const hash = itemId.slice(5);
	const itemDef = await DestinyInventoryItemDefinition.get(hash);

	api.emitProgress(1);
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
}

const itemViewBase = View.create({
	models: (item: Item | string) =>
		[Model.createTemporary(async api => typeof item !== "string" ? undefined : resolveItemURL(item, api))],
	id: "item",
	hash: (item: Item | string) => typeof item === "string" ? `item/${item}` : `item/${item.bucket}/${item.id}`,
	name: (item: Item | string) => typeof item === "string" ? "Inspect Item" : item.definition.displayProperties.name,
	noDestinationButton: true,
	initialise: (view, itemModel) => {
		LoadingManager.end(view.definition.id);

		const item = view._args[1] = itemModel ?? view._args[1]! as Item;

		console.log(item.definition.displayProperties.name, item);

		view.classes.toggle(!item.instance, ItemViewClasses.ItemDefinition)
			.setTitle(title => title.text.set(item.definition.displayProperties.name))
			.setSubtitle(subtitle => subtitle.text.set(item.definition.itemTypeDisplayName));

		ItemComponent.create([item])
			.classes.remove(ButtonClasses.Main)
			.classes.add(ItemViewClasses.Item)
			.clearTooltip()
			.prependTo(view.header);

		Component.create("p")
			.classes.add(ItemViewClasses.FlavourText)
			.text.set(item.definition.flavorText)
			.appendTo(view.header);

		if (item.instance)
			Button.create()
				.classes.add(ItemViewClasses.ButtonViewInCollections)
				.text.set("View in Collections")
				.event.subscribe("click", () => ItemView.showCollections(item))
				.appendTo(view.header);

		Component.create()
			.classes.add(ItemViewClasses.PerksModsTraits)
			.append(ItemPerks.create([item])
				.event.subscribe("showCollections", () => ItemView.showCollections(item)))
			// .append(ItemMods.create([item]))
			.append(ItemIntrinsics.create([item]))
			.appendTo(view.content);

		Component.create()
			.classes.add(ItemViewClasses.Stats)
			.appendTo(view.content);
	},
});

type ItemViewBase = typeof itemViewBase;
interface ItemViewClass extends ItemViewBase { }
class ItemViewClass extends View.Handler<Model.Impl<Item | undefined>[], [item: string | Item]> {
	public showCollections (item: Item) {
		this.show(`collections/hash:${item.definition.hash}`);
	}
}

const ItemView = Objects.inherit(itemViewBase, ItemViewClass);
export default ItemView;
