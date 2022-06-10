import InventorySlotView from "ui/view/InventorySlotView";

export default InventorySlotView.create({
	id: "energy",
	name: "Energy",
	slot: slots => slots.byName("EnergyWeapon"),
});
