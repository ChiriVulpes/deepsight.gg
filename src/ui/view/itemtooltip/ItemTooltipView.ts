import { BucketHashes } from "bungie-api-ts/destiny2";
import InventoryModel from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { BucketId } from "model/models/items/Item";
import { CharacterId } from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import Component from "ui/Component";
import Button from "ui/form/Button";
import ItemTooltip from "ui/inventory/ItemTooltip";
import LoadingManager from "ui/LoadingManager";
import View from "ui/View";
import ItemView from "ui/view/item/ItemView";

export enum ItemTooltipViewClasses {
	Tooltip = "view-item-tooltip-tooltip",
	Button = "view-item-tooltip-button",
	Buttons = "view-item-tooltip-buttons",
}

export default View.create({
	models: [Manifest, InventoryModel.createTemporary()] as const,
	noDestinationButton: true,
	id: "item-tooltip",
	hash: (item: Item | string) => typeof item === "string" ? `item-tooltip/${item}` : `item-tooltip/${item.bucket}/${item.id}`,
	name: (item: Item | string) => typeof item === "string" ? "Item" : item.definition.displayProperties.name,
	initialise: async (view, manifest, inventory) => {
		LoadingManager.end(view.definition.id);

		let [, itemArg] = view._args as [any, Item | string | undefined];
		if (typeof itemArg === "string") {
			const [bucketId, itemId] = itemArg.split("/") as [BucketId, string];
			itemArg = inventory.buckets?.[bucketId].items.find(item => item.id === itemId);
		}

		if (!itemArg)
			return;

		const item = itemArg;
		view._args[1] = item;

		console.log(item.definition.displayProperties.name, item);
		const character = inventory.getCharacter(item.character);

		const itemTooltip = ItemTooltip.createRaw()
			.classes.add(ItemTooltipViewClasses.Tooltip);
		await itemTooltip.setItem(item, character);

		itemTooltip.appendTo(view.content);
		itemTooltip.footer.remove();

		const { DestinyClassDefinition } = manifest;

		const buttons = Component.create()
			.classes.add(ItemTooltipViewClasses.Buttons)
			.appendTo(view.content);

		const cls = !character ? undefined : await DestinyClassDefinition.get(character.classHash);
		const className = cls?.displayProperties.name ?? "Unknown";
		const isEngram = item.reference.bucketHash === BucketHashes.Engrams;

		if (!CharacterId.is(item.bucket) && !item.equipped && !isEngram)
			Button.create()
				.classes.add(ItemTooltipViewClasses.Button)
				.text.set(`Pull to ${className}`)
				.event.subscribe("click", () => {
					void item.transferToCharacter(character!.characterId as CharacterId);
					view.back();
				})
				.appendTo(buttons);

		if (CharacterId.is(item.bucket) && !item.equipped)
			Button.create()
				.classes.add(ItemTooltipViewClasses.Button)
				.text.set(`Equip to ${className}`)
				.event.subscribe("click", () => {
					void item.equip(character!.characterId as CharacterId);
					view.back();
				})
				.appendTo(buttons);

		if (item.bucket !== "vault" && !item.equipped && !isEngram)
			Button.create()
				.classes.add(ItemTooltipViewClasses.Button)
				.text.set("Vault")
				.event.subscribe("click", () => {
					void item.transferToVault();
					view.back();
				})
				.appendTo(buttons);

		if (!isEngram)
			Button.create()
				.classes.add(ItemTooltipViewClasses.Button)
				.text.set("Inspect")
				.event.subscribe("click", () => ItemView.show(item))
				.appendTo(buttons);
	},
});
