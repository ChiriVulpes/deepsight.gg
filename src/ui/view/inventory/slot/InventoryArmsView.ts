import { BucketHashes } from "bungie-api-ts/destiny2";
import InventoryArmourView from "ui/view/inventory/slot/InventoryArmourSlotView";

export default InventoryArmourView.create({
	id: "arms",
	name: "Arms",
	slot: BucketHashes.Gauntlets,
});
