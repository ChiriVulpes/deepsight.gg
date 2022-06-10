import InventorySlotView from "ui/view/InventorySlotView";

export default InventorySlotView.create({
	id: "class-item",
	name: "Class Item",
	slot: slots => slots.byName("ClassItems"),
});
