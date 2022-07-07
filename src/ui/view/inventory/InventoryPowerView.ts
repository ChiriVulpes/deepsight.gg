import Filter from "ui/inventory/filter/Filter";
import FilterManager from "ui/inventory/filter/FilterManager";
import InventoryWeaponView from "ui/view/inventory/InventoryWeaponView";

export default InventoryWeaponView.create({
	id: "power",
	name: "Power",
	slot: slots => slots.byName("PowerWeapon"),
	filter: new FilterManager({
		id: "heavyWeapons",
		name: "Heavy Weapons",
		inapplicable: [Filter.Ammo],
	}),
});
