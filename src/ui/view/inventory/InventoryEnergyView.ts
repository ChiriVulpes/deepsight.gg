import InventoryWeaponView from "ui/view/inventory/InventoryWeaponView";

export default InventoryWeaponView.create({
	id: "energy",
	name: "Energy",
	slot: slots => slots.byName("EnergyWeapon"),
});
