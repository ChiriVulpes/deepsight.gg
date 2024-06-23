import { InventoryBucketHashes } from "@deepsight.gg/enums";
import Model from "model/Model";
import Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import Button from "ui/component/Button";
import Component from "ui/component/Component";
import ItemTooltip from "ui/destiny/tooltip/ItemTooltip";
import LoadingManager from "ui/utility/LoadingManager";
import View from "ui/view/View";
import ItemView, { resolveItemURL } from "ui/view/item/ItemView";

export enum ItemTooltipViewClasses {
	Tooltip = "view-item-tooltip-tooltip",
	Button = "view-item-tooltip-button",
	Buttons = "view-item-tooltip-buttons",
}

const tooltipViewModels = [Manifest, Inventory.createModel()] as const;
export default View.create({
	models: (item: Item | string) => [
		...tooltipViewModels,
		...typeof item !== "string" ? []
			: [Model.createTemporary(async api => resolveItemURL(item, api))]] as const,
	noDestinationButton: true,
	id: "item-tooltip",
	hash: (item: Item | string) => typeof item === "string" ? `item-tooltip/${item}` : `item-tooltip/${item.bucket.isCollections() ? "collections" : item.bucket.hash}/${item.id}`,
	name: (item: Item | string) => typeof item === "string" ? "Item" : item.definition.displayProperties.name,
	initialise: async (view, manifest, inventory, itemModel) => {
		LoadingManager.end(view.definition.id);

		const item = view._args[1] = itemModel ?? view._args[1]! as Item;

		console.log(item.definition.displayProperties.name, item);
		const owner = item.owner;

		const itemTooltip = ItemTooltip.createRaw()
			.classes.add(ItemTooltipViewClasses.Tooltip);
		await itemTooltip.setItem(item, inventory);

		itemTooltip.appendTo(view.content);
		itemTooltip.footer.remove();

		const { DestinyClassDefinition } = manifest;

		const buttons = Component.create()
			.classes.add(ItemTooltipViewClasses.Buttons)
			.appendTo(view.content);

		const cls = !owner ? undefined : await DestinyClassDefinition.get(owner.classHash);
		const className = cls?.displayProperties.name ?? "Unknown";
		const inEngramBucket = item.reference.bucketHash === InventoryBucketHashes.Engrams;

		if (owner && !item.bucket.isCharacter() && !item.equipped && !inEngramBucket)
			Button.create()
				.classes.add(ItemTooltipViewClasses.Button)
				.text.set(`Pull to ${className}`)
				.event.subscribe("click", () => {
					void item.transferToCharacter(owner.characterId);
					view.back();
				})
				.appendTo(buttons);

		if (owner && item.bucket.isCharacter() && !item.equipped)
			Button.create()
				.classes.add(ItemTooltipViewClasses.Button)
				.text.set(`Equip to ${className}`)
				.event.subscribe("click", () => {
					void item.equip(owner.characterId);
					view.back();
				})
				.appendTo(buttons);

		if (item.bucket.isVault() && !item.equipped && !inEngramBucket)
			Button.create()
				.classes.add(ItemTooltipViewClasses.Button)
				.text.set("Vault")
				.event.subscribe("click", () => {
					void item.transferToVault();
					view.back();
				})
				.appendTo(buttons);

		if (!inEngramBucket)
			Button.create()
				.classes.add(ItemTooltipViewClasses.Button)
				.text.set("Details")
				.event.subscribe("click", () => ItemView.show(item))
				.appendTo(buttons);
	},
});
