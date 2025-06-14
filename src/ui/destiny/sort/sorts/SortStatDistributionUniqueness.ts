import type Item from "model/models/items/Item";
import Component from "ui/component/Component";
import Sort, { ISort } from "ui/destiny/sort/Sort";
import { ARMOUR_STAT_GROUPS, Stat } from "ui/destiny/utility/Stat";
import Maths from "utility/maths/Maths";

interface StatRoll {
	[Stat.Mobility]: number;
	[Stat.Resilience]: number;
	[Stat.Recovery]: number;
	[Stat.Discipline]: number;
	[Stat.Intellect]: number;
	[Stat.Strength]: number;
}

const ARMOUR_STATS = ARMOUR_STAT_GROUPS.flat() as (keyof StatRoll)[];

const ARCHETYPES = [
	[Stat.Mobility, Stat.Discipline], // Gunner
	[Stat.Strength, Stat.Resilience], // Brawler
	[Stat.Recovery, Stat.Mobility], // Specialist
	[Stat.Intellect, Stat.Strength], // Paragon
	[Stat.Discipline, Stat.Intellect], // Grenadier
	[Stat.Resilience, Stat.Recovery], // Bulwark
]
	.flatMap(([primary, secondary]) => ARMOUR_STATS
		.filter(stat => stat !== primary && stat !== secondary)
		.map(tertiary => [primary, secondary, tertiary] as const)
	)
	.map(([primary, secondary, tertiary]): StatRoll => ({
		[Stat.Mobility]: 0,
		[Stat.Resilience]: 0,
		[Stat.Recovery]: 0,
		[Stat.Discipline]: 0,
		[Stat.Intellect]: 0,
		[Stat.Strength]: 0,
		[primary]: 30,
		[secondary]: 23,
		[tertiary]: 15,
	}));

function getUniqueness (item: Item): number {
	if (!item.stats || !ARMOUR_STAT_GROUPS.flat().some(stat => item.stats?.values[stat]?.roll))
		return 0;

	const roll: StatRoll = ARMOUR_STATS.toObject(stat => [stat, item.stats?.values[stat]?.roll ?? 0]);
	const totalStats = ARMOUR_STATS.reduce((sum, stat) => sum + roll[stat], 0);
	const difference = 68 - totalStats;

	// 1. Find the Euclidean distance to every possible archetype.
	const allDistances = ARCHETYPES.map((archetypeRoll) => calculateEuclideanDistance(roll, archetypeRoll));

	// 2. The roll's "raw score" is its distance to the CLOSEST archetype.
	const minDistance = Math.min(...allDistances);

	// 3. Normalize against the score of a perfectly flat roll.
	const flatValue = 68 / 6;
	const flatRoll: StatRoll = {
		[Stat.Mobility]: flatValue,
		[Stat.Resilience]: flatValue,
		[Stat.Recovery]: flatValue,
		[Stat.Discipline]: flatValue,
		[Stat.Intellect]: flatValue,
		[Stat.Strength]: flatValue,
	};

	const flatRollDistances = ARCHETYPES.map((archetypeRoll) => calculateEuclideanDistance(flatRoll, archetypeRoll));
	const maxPossibleMinDistance = Math.min(...flatRollDistances);

	if (maxPossibleMinDistance === 0) return 0;

	const uniqueness = Maths.unlerp(0, 0.8, minDistance / maxPossibleMinDistance); // cap out uniqueness

	const uselessValueDifference = 15;
	return (1
		* Math.min(1, Math.max(0, uniqueness))
		* (1 - Math.min(difference, uselessValueDifference) / uselessValueDifference) // Apply a penalty for deviation from 68 total
	);
}

// function dotProduct (rollA: StatRoll, rollB: StatRoll): number {
// 	let product = 0;
// 	for (const stat of ARMOUR_STATS)
// 		product += rollA[stat] * rollB[stat];
// 	return product;
// }

// function magnitude (roll: StatRoll): number {
// 	let sumOfSquares = 0;
// 	for (const stat of ARMOUR_STATS)
// 		sumOfSquares += roll[stat] ** 2;
// 	return Math.sqrt(sumOfSquares);
// }

function calculateEuclideanDistance (rollA: StatRoll, rollB: StatRoll): number {
	let sumOfSquares = 0;
	for (const stat of ARMOUR_STATS)
		sumOfSquares += (rollA[stat] - rollB[stat]) ** 2;
	return Math.sqrt(sumOfSquares);
}

export default ISort.create({
	id: Sort.StatLegacyDistribution,
	name: "Legacy Distribution",
	shortName: "Legacy",
	sort: (a, b) => getUniqueness(b) - getUniqueness(a),
	render: (item, uniqueness = getUniqueness(item)) => uniqueness <= 0 ? undefined
		: (Component.create()
			.classes.add("item-stat-distribution")
			.append(Component.create("span")
				.classes.add("item-stat-distribution-value")
				.style.set("--value", `${uniqueness}`)
				.text.set(`${Math.round(uniqueness * 100)}%`)
			)
		),
	renderSortable: sortable => sortable.icon.text.set("%"),
});
