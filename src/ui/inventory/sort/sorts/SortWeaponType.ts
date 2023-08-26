import { BucketHashes, ItemCategoryHashes } from "bungie-api-ts/destiny2";
import type Item from "model/models/items/Item";
import Component from "ui/Component";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.WeaponType,
	name: "Weapon Type",
	sort: (a, b) => a.definition.itemTypeDisplayName.localeCompare(b.definition.itemTypeDisplayName),
	// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
	render: item => !item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) ? undefined
		: Component.create()
			.classes.add("item-weapon-type-icon")
			.style.set("--icon", getWeaponTypeMaskIconPath(item)),
});

export function getWeaponTypeMaskIconPath (item: Item | string) {
	let svgName = (typeof item === "string" ? item : item.definition.itemTypeDisplayName)
		.toLowerCase()
		.replace(/\W+/g, "_");

	if (svgName === "grenade_launcher" && typeof item !== "string" && item.definition.inventory?.bucketTypeHash === BucketHashes.PowerWeapons)
		svgName = "grenade_launcher_heavy";

	return `url("image/svg/weapon/${svgName}.svg")`;
}
