import { TierType } from "bungie-api-ts/destiny2";
import Sort, { ISort } from "ui/destiny/sort/Sort";
import Display from "ui/utility/DisplayProperties";

export default ISort.create({
	id: Sort.Exotic,
	name: "Exotic",
	renderSortable: sortable => sortable.icon,
	sort: (a, b) => a.isExotic() && b.isExotic() ? Display.name(a.definition, "").localeCompare(Display.name(b.definition, ""))
		: Math.max(b.definition.inventory?.tierType ?? TierType.Unknown, TierType.Superior) - Math.max(a.definition.inventory?.tierType ?? TierType.Unknown, TierType.Superior),
});
