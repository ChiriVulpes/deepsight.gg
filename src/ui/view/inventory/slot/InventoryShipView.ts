import { BucketHashes } from "bungie-api-ts/destiny2";
import InventoryEquipmentSlotView from "ui/view/inventory/slot/InventoryEquipmentSlotView";

export default InventoryEquipmentSlotView.create({
	id: "ship",
	name: "Ship",
	slot: BucketHashes.Ships,
});
