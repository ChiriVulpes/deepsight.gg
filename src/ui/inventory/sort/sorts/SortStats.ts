import StatTypes from "model/models/enum/StatTypes";
import Component from "ui/Component";
import EnumIcon from "ui/bungie/EnumIcon";
import { ARMOUR_STAT_GROUPS, ARMOUR_STAT_MAX } from "ui/inventory/Stat";
import { ISort } from "ui/inventory/sort/Sort";

export default async function GenerateStatsSorts () {
	const stats = await StatTypes.all;
	return stats.array.map(stat => ISort.create({
		id: `stat-${stat.displayProperties.name.replace(/\W+/g, "")}`,
		name: stat.displayProperties.name,
		renderSortable: sortable => sortable.maskIcon
			.classes.add("item-sort-drawer-sort-stat-icon")
			.tweak(EnumIcon.applyIconVar, StatTypes, stat.hash),
		sort: (a, b) => (b.stats?.values[stat.hash]?.roll ?? 0) - (a.stats?.values[stat.hash]?.roll ?? 0),
		render: (item, value = item.stats?.values[stat.hash]) => !value?.roll ? undefined : Component.create()
			.classes.add("item-extra-stat-wrapper")
			.tweak(EnumIcon.applyIconVar, StatTypes, stat.hash)
			.text.add(`${value.roll}`)
			.style.set("--value", `${value.roll / (ARMOUR_STAT_GROUPS.some(group => group.includes(stat.hash)) ? ARMOUR_STAT_MAX : value.max ?? 100)}`),
	}));
}
