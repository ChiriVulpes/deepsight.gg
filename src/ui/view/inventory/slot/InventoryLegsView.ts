import { BucketHashes } from "bungie-api-ts/destiny2";
import InventoryArmourSlotView from "ui/view/inventory/slot/InventoryArmourSlotView";

export default InventoryArmourSlotView.create({
	id: "legs",
	name: "Legs",
	slot: BucketHashes.LegArmor,
});
