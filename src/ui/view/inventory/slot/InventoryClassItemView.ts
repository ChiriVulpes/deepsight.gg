import { BucketHashes } from "bungie-api-ts/destiny2";
import Sort from "ui/inventory/sort/Sort";
import SortManager from "ui/inventory/sort/SortManager";
import InventoryArmourSlotView, { SORTS_DEFAULT_ARMOUR, SORTS_INAPPLICABLE_ARMOUR } from "ui/view/inventory/slot/InventoryArmourSlotView";

export default InventoryArmourSlotView.create({
	id: "class-item",
	name: "Class Item",
	slot: BucketHashes.ClassArmor,
	sort: new SortManager({
		id: "class-items",
		name: "Class Items",
		default: SORTS_DEFAULT_ARMOUR,
		inapplicable: [...SORTS_INAPPLICABLE_ARMOUR, Sort.StatDistribution, Sort.StatTotal, "stat-.*"],
	}),
});
