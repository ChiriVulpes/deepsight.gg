import InventoryArmourView from "ui/view/inventory/InventoryArmourView";

export default InventoryArmourView.create({
	id: "helmet",
	name: "Helmet",
	slot: slots => slots.byName("Helmets"),
});