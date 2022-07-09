import { ItemCategoryHashes } from "bungie-api-ts/destiny2";
import InventoryWeaponView from "ui/view/inventory/InventoryWeaponView";

export default InventoryWeaponView.create({
	id: "energy",
	name: "Energy",
	slot: ItemCategoryHashes.EnergyWeapon,
});
