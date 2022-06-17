import InventoryArmourView from "ui/view/inventory/InventoryArmourView";

export default InventoryArmourView.create({
	id: "arms",
	name: "Arms",
	slot: slots => slots.byName("Arms"),
});
