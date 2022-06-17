import InventoryArmourView from "ui/view/inventory/InventoryArmourView";

export default InventoryArmourView.create({
	id: "chest",
	name: "Chest",
	slot: slots => slots.byName("Chest"),
});
