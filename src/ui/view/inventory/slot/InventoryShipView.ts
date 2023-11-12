import { InventoryBucketHashes } from "@deepsight.gg/enums";
import InventoryEquipmentSlotView from "ui/view/inventory/slot/InventoryEquipmentSlotView";

export default InventoryEquipmentSlotView.create({
	id: "ship",
	name: "Ship",
	slot: InventoryBucketHashes.Ships,
});
