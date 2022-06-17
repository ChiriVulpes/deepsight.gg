import InventoryArmourView from "ui/view/inventory/InventoryArmourView";

export default InventoryArmourView.create({
	id: "class-item",
	name: "Class Item",
	slot: slots => slots.byName("ClassItems"),
});
