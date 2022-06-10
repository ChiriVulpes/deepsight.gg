import InventorySlotView from "ui/view/InventorySlotView";

export default InventorySlotView.create({
	id: "power",
	name: "Power",
	slot: slots => slots.byName("PowerWeapon"),
});
