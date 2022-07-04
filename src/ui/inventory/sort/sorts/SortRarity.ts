import { TierType } from "bungie-api-ts/destiny2";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.Rarity,
	name: "Rarity",
	sort: (a, b) => (b.definition.inventory?.tierType ?? TierType.Unknown) - (a.definition.inventory?.tierType ?? TierType.Unknown),
});
