import InventorySlotView from "ui/view/InventorySlotView";

export default InventorySlotView.create({
	id: "chest",
	name: "Chest",
	slot: slots => slots.byName("Chest"),
});
