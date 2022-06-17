import InventoryWeaponView from "ui/view/inventory/InventoryWeaponView";

export default InventoryWeaponView.create({
	id: "kinetic",
	name: "Kinetic",
	slot: slots => slots.byName("KineticWeapon"),
});
