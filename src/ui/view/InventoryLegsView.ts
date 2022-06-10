import InventorySlotView from "ui/view/InventorySlotView";

export default InventorySlotView.create({
	id: "legs",
	name: "Legs",
	slot: slots => slots.byName("Legs"),
});
