import { BucketHashes } from "bungie-api-ts/destiny2";
import InventoryArmourView from "ui/view/inventory/InventoryArmourView";

export default InventoryArmourView.create({
	id: "legs",
	name: "Legs",
	slot: BucketHashes.LegArmor,
});
