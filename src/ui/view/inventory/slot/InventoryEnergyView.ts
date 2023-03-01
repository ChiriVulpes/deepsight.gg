import { BucketHashes } from "bungie-api-ts/destiny2";
import InventoryWeaponView from "ui/view/inventory/slot/InventoryWeaponSlotView";

export default InventoryWeaponView.create({
	id: "energy",
	name: "Energy",
	slot: BucketHashes.EnergyWeapons,
});
