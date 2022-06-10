import InventorySlotView from "ui/view/InventorySlotView";

export default InventorySlotView.create({
	id: "helmet",
	name: "Helmet",
	slot: slots => slots.byName("Helmets"),
});
