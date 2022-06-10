import InventorySlotView from "ui/view/InventorySlotView";

export default InventorySlotView.create({
	id: "arms",
	name: "Arms",
	slot: slots => slots.byName("Arms"),
});
