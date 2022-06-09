import InventorySlotView from "ui/view/InventorySlotView";

export default InventorySlotView.create({
	id: "kinetic",
	name: "Kinetic",
	slot: slots => slots.byName("KineticWeapon"),
});
