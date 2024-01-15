import { InventoryBucketHashes } from "@deepsight.gg/enums";
import type Model from "model/Model";
import Inventory from "model/models/Inventory";
import View from "ui/View";
import type { IInventoryViewDefinition } from "ui/view/inventory/InventoryView";
import InventoryView from "ui/view/inventory/InventoryView";

export interface IInventorySlotViewDefinition extends IInventoryViewDefinition {
	slot: InventoryBucketHashes;
}

export default new View.Factory()
	.using(Inventory.createModel())
	.define<IInventorySlotViewDefinition>()
	.initialise((view, model) =>
		view.make(InventoryView, model))
	.wrapper<InventoryView & View.WrapperComponent<[Model<Inventory>], [], IInventorySlotViewDefinition & View.IViewBase<[]>>>()
	.configure(definition => ({
		layout: {
			columns: [
				{ hash: definition.slot, size: "fixed" },
				{
					hash: InventoryBucketHashes.General,
					subInventoryHash: definition.slot,
					merged: true,
				},
				{ hash: InventoryBucketHashes.LostItems, size: "fixed" },
			],
		},
	}));
