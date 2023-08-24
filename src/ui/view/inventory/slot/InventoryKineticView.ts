import { BucketHashes } from "bungie-api-ts/destiny2";
import InventoryWeaponSlotView from "ui/view/inventory/slot/InventoryWeaponSlotView";

export default InventoryWeaponSlotView.create({
	id: "kinetic",
	name: "Kinetic",
	slot: BucketHashes.KineticWeapons,
});
