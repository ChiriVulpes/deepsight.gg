import { InventoryBucketHashes } from "@deepsight.gg/enums";
import InventoryWeaponSlotView from "ui/view/inventory/slot/InventoryWeaponSlotView";

export default InventoryWeaponSlotView.create({
	id: "kinetic",
	name: "Kinetic",
	slot: InventoryBucketHashes.KineticWeapons,
});
