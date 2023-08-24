import { BucketHashes } from "bungie-api-ts/destiny2";
import InventoryEquipmentSlotView from "ui/view/inventory/slot/InventoryEquipmentSlotView";

export default InventoryEquipmentSlotView.create({
	id: "sparrow",
	name: "Sparrow",
	slot: BucketHashes.Vehicle,
});
