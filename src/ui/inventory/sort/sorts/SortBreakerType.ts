import { DestinyBreakerType } from "bungie-api-ts/destiny2";
import BreakerTypes from "model/models/enum/BreakerTypes";
import Component from "ui/Component";
import EnumIcon from "ui/bungie/EnumIcon";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create({
	id: Sort.BreakerType,
	name: "Stun",
	shortName: "Stun",
	sort: (a, b) =>
		(a.breakerTypes?.sort(type => type.enumValue)[0]?.enumValue ?? 0) - (b.breakerTypes?.sort(type => type.enumValue)[0]?.enumValue ?? 0),
	renderSortable: sortable => {
		const baseIcon = sortable.icon;
		EnumIcon.create([BreakerTypes, DestinyBreakerType.ShieldPiercing])
			.classes.add(...baseIcon.classes.all())
			.prependTo(sortable.title);
		baseIcon.remove();
	},
	render: (item, breakerTypes = item.breakerTypes) => !breakerTypes?.length ? undefined
		: Component.create("span")
			.classes.add("item-sort-breaker-type-wrapper")
			.append(...breakerTypes
				.sort(type => -type.enumValue)
				.map(type => EnumIcon.create([BreakerTypes, type.enumValue])
					.classes.add("item-sort-breaker-type"))),
});
