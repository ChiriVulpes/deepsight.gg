import { BucketHashes } from "bungie-api-ts/destiny2";
import InventoryArmourView from "ui/view/inventory/slot/InventoryArmourSlotView";

export default InventoryArmourView.create({
	id: "helmet",
	name: "Helmet",
	slot: BucketHashes.Helmet,
});
