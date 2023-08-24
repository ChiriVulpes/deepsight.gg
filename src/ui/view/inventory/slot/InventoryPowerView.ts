import { BucketHashes } from "bungie-api-ts/destiny2";
import Filter from "ui/inventory/filter/Filter";
import FilterManager from "ui/inventory/filter/FilterManager";
import InventoryWeaponSlotView, { FILTERS_INAPPLICABLE_WEAPONS } from "ui/view/inventory/slot/InventoryWeaponSlotView";

export default InventoryWeaponSlotView.create({
	id: "power",
	name: "Power",
	slot: BucketHashes.PowerWeapons,
	filter: new FilterManager({
		id: "heavyWeapons",
		name: "Heavy Weapons",
		inapplicable: [...FILTERS_INAPPLICABLE_WEAPONS, Filter.Ammo],
	}),
});
