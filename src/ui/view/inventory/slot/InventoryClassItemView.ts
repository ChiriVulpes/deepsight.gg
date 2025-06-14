import { InventoryBucketHashes } from "@deepsight.gg/enums";
import Sort from "ui/destiny/sort/Sort";
import SortManager from "ui/destiny/sort/SortManager";
import InventoryArmourSlotView, { SORTS_DEFAULT_ARMOUR, SORTS_INAPPLICABLE_ARMOUR } from "ui/view/inventory/slot/InventoryArmourSlotView";

export default InventoryArmourSlotView.create({
	id: "class-item",
	name: "Class Item",
	slot: InventoryBucketHashes.ClassArmor,
	sort: new SortManager({
		id: "class-items",
		name: "Class Items",
		default: SORTS_DEFAULT_ARMOUR,
		inapplicable: [...SORTS_INAPPLICABLE_ARMOUR, Sort.Exotic, Sort.StatDistribution, Sort.StatLegacyDistribution, Sort.StatTotal, "stat-.*"],
	}),
});
