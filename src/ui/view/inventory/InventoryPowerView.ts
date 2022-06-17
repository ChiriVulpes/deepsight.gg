import InventoryWeaponView from "ui/view/inventory/InventoryWeaponView";

export default InventoryWeaponView.create({
	id: "power",
	name: "Power",
	slot: slots => slots.byName("PowerWeapon"),
});
