import { InventoryBucketHashes } from "@deepsight.gg/enums";
import type Model from "model/Model";
import Characters from "model/models/Characters";
import Inventory from "model/models/Inventory";
import { Bucket } from "model/models/items/Bucket";
import Component from "ui/Component";
import View from "ui/View";
import type { IInventoryViewDefinition } from "ui/view/inventory/InventoryView";
import InventoryView from "ui/view/inventory/InventoryView";
import type { IInventorySlotViewDefinition } from "ui/view/inventory/slot/InventorySlotView";
import Functions from "utility/Functions";

export enum InventorySlotColumnsViewClasses {
	Content = "view-slot-columns-content",
	SectionTitle = "view-slot-columns-section-title",
	SectionContent = "view-slot-columns-section-content",
	SectionWeapons = "view-slot-columns-section-weapons",
	SectionArmour = "view-slot-columns-section-armour",
	SlotColumn = "view-slot-columns-slot-column",
	PostmasterColumn = "view-slot-columns-slot-column-postmaster",
	SlotColumnTitle = "view-slot-columns-slot-column-title",
}

export interface IInventorySlotColumnsViewDefinition extends IInventoryViewDefinition {
	childViews: View.Handler<readonly [Model<Inventory>], [], IInventorySlotViewDefinition & View.IViewBase<[]>>[];
	mergedVaults: boolean;
	scrollToTop?: true;
}

export default new View.Factory()
	.using(Inventory.createModel())
	.define<IInventorySlotColumnsViewDefinition>()
	.initialise((view, model) =>
		view.make(InventoryView, model))
	.wrapper<InventoryView & View.WrapperComponent<[Model<Inventory>], [], IInventorySlotColumnsViewDefinition & View.IViewBase<[]>>>()
	.configure(definition => ({
		layout: view => {
			const chars = Characters.getSorted();
			view.super.content
				.classes.add(InventorySlotColumnsViewClasses.Content)
				.style.set("--buckets", `${definition.mergedVaults ? chars.length + 1 : chars.length * 2}`);

			for (const childView of definition.childViews) {
				const column = Component.create()
					.classes.add(InventorySlotColumnsViewClasses.SlotColumn)
					.appendTo(view.super.content);

				Component.create()
					.classes.add(InventorySlotColumnsViewClasses.SlotColumnTitle)
					.text.set(Functions.resolve(childView.name) ?? "?")
					.appendTo(column);

				for (const character of chars) {
					view.addBucketsTo(column, Bucket.id(childView.definition.slot, character.characterId));
					if (!definition.mergedVaults)
						view.addBucketsTo(column, Bucket.id(InventoryBucketHashes.General, character.characterId, childView.definition.slot));
				}

				if (definition.mergedVaults)
					view.addBucketsTo(column, Bucket.id(InventoryBucketHashes.General, undefined, childView.definition.slot));
			}

			if (definition.childViews.length <= 3)
				Component.create()
					.classes.add(InventorySlotColumnsViewClasses.SlotColumn, InventorySlotColumnsViewClasses.PostmasterColumn)
					.append(Component.create())
					.appendTo(view.super.content)
					.tweak(column => chars
						.map(character => Bucket.id(InventoryBucketHashes.LostItems, character.characterId))
						.collect(bucketIds => view.addBucketsTo(column, bucketIds)));
		},
		onItemMoveStart (view, wrapper, item, event) {
			if (definition.scrollToTop) {
				wrapper.content.element.scrollTo({ top: 0, behavior: "smooth" });
			}
		},
	}));
