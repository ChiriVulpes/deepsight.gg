import type { InventoryBucketHashes } from "@deepsight.gg/enums";
import type Model from "model/Model";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type View from "ui/View";
import type { IInventoryViewDefinition } from "ui/view/inventory/InventoryView";
import Tuples from "utility/Tuples";

export interface IInventorySlotViewDefinition extends IInventoryViewDefinition {
	slot: InventoryBucketHashes;
	mergedVaults?: true;
}

export namespace IInventorySlotViewDefinition {
	export function is (definition?: View.IViewBase<any[]>): definition is IInventorySlotViewDefinition & View.IViewBase<any[]> {
		return definition !== undefined && "slot" in definition && typeof definition.slot === "number";
	}
	export function as (definition?: View.IViewBase<any[]>): IInventorySlotViewDefinition & View.IViewBase<any[]> | undefined {
		return is(definition) ? definition : undefined;
	}
}

export type InventorySlotViewHandler = View.Handler<readonly [Model<Inventory>], [], IInventorySlotViewDefinition & View.IViewBase<[]>>;

export namespace InventorySlotViewHandler {
	export function getSorter (item: Item) {
		return Object.values(viewManager.registry)
			.map(view => Tuples.make(view, IInventorySlotViewDefinition.is(view.definition) ? view.definition.slot : undefined))
			.findMap(Tuples.filter(1, slot => slot === item.definition.inventory?.bucketTypeHash),
				([view]) => IInventorySlotViewDefinition.as(view.definition)?.sort);
	}
}
