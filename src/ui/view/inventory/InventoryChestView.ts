import { ItemCategoryHashes } from "bungie-api-ts/destiny2";
import InventoryArmourView from "ui/view/inventory/InventoryArmourView";

export default InventoryArmourView.create({
	id: "chest",
	name: "Chest",
	slot: ItemCategoryHashes.Chest,
});
