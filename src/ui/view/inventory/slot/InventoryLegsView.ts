import { InventoryBucketHashes } from "@deepsight.gg/enums";
import InventoryArmourSlotView from "ui/view/inventory/slot/InventoryArmourSlotView";

export default InventoryArmourSlotView.create({
	id: "legs",
	name: "Legs",
	slot: InventoryBucketHashes.LegArmor,
});
