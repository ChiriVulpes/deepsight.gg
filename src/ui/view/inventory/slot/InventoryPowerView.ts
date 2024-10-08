import { InventoryBucketHashes } from "@deepsight.gg/enums";
import Filter from "ui/destiny/filter/Filter";
import FilterManager from "ui/destiny/filter/FilterManager";
import InventoryWeaponSlotView, { FILTERS_INAPPLICABLE_WEAPONS } from "ui/view/inventory/slot/InventoryWeaponSlotView";

export default InventoryWeaponSlotView.create({
	id: "power",
	name: "Power",
	slot: InventoryBucketHashes.PowerWeapons,
	filter: new FilterManager({
		id: "heavyWeapons",
		name: "Heavy Weapons",
		inapplicable: [...FILTERS_INAPPLICABLE_WEAPONS, Filter.Ammo],
	}),
});
