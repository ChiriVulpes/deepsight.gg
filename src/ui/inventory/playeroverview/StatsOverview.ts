import { ItemCategoryHashes } from "@deepsight.gg/enums";
import { DeepsightPlugCategory } from "@deepsight.gg/plugs";
import type { Character } from "model/models/Characters";
import DamageTypes from "model/models/enum/DamageTypes";
import type { Bucket } from "model/models/items/Bucket";
import type { IStat } from "model/models/items/Stats";
import { ARMOUR_STAT_GROUPS } from "ui/inventory/Stat";
import type { ICustomStatDisplayDefinition } from "ui/inventory/tooltip/ItemStat";
import ItemStat, { CustomStat } from "ui/inventory/tooltip/ItemStat";
import Maths from "utility/maths/Maths";

export enum StatsOverviewClasses {
	Main = "stats-overview",
	IsDamageType = "stats-overview--damage-type",
	Wrapper = "stats-overview-wrapper",
}

export default class StatsOverview extends ItemStat.Wrapper {

	protected override onMake (): void {
		super.onMake();
		this.classes.add(StatsOverviewClasses.Main);
	}

	public set (character: Character, buckets: Bucket[]) {
		const equippedItems = buckets.map(bucket => bucket.equippedItem)
			.filter(item => item?.isArmour() || item?.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Subclasses));

		const subclass = equippedItems.find(item => item?.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Subclasses));
		this.classes.removeWhere(cls => cls.startsWith(StatsOverviewClasses.IsDamageType))
			.classes.add(`${StatsOverviewClasses.IsDamageType}-${DamageTypes.nameOf(subclass?.getDamageType())}`);

		const displays: ICustomStatDisplayDefinition[] = [];
		for (const group of ARMOUR_STAT_GROUPS) {
			for (const hash of group) {

				let statInstance: IStat | undefined;
				const statValues = {
					value: 0,
					mod: 0,
					intrinsic: 0,
					masterwork: 0,
					roll: 0,
					subclass: 0,
					charge: 0,
				} satisfies Partial<IStat>;

				for (const item of equippedItems) {
					const stat = item?.stats?.values[hash];
					let value = stat?.value ?? 0;
					statValues.mod += stat?.mod ?? 0;
					statValues.intrinsic += stat?.intrinsic ?? 0;
					statValues.masterwork += stat?.masterwork ?? 0;
					statValues.roll += stat?.roll ?? 0;
					statValues.charge += stat?.charge ?? 0;
					statInstance ??= stat;

					if (item?.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Subclasses)) {
						value = 0;
						statValues.subclass += item.getSocketedPlugs("Subclass/Fragment")
							.map(fragment => {
								const isClassStat = fragment.getCategorisationAs(DeepsightPlugCategory.Subclass)?.affectsClassStat;
								if (isClassStat && character.stat?.hash !== hash)
									return 0;

								return fragment.definition?.investmentStats?.find(stat => stat.statTypeHash === hash)?.value ?? 0;
							})
							.splat(Maths.sum);
					}

					statValues.value += value;
				}

				if (!statInstance?.definition) {
					console.warn(`No equipped items have stat ${hash}`);
					continue;
				}

				statValues.value += statValues.subclass;

				displays.push({
					...statInstance,
					...statValues,
					override: {
						max: 100,
						group: undefined,
						plus: undefined,
						chunked: true,
					},
				});
			}
		}

		displays.push({
			hash: CustomStat.Tiers,
			order: 1002,
			name: "Tiers",
			calculate: (stat, stats, item) => {
				const armourStats = ARMOUR_STAT_GROUPS.flat();
				stats = stats.filter(stat => armourStats.includes(stat.hash));
				const tiers = stats.map(stat => Math.floor((stat.value ?? 0) / 10)).splat(Maths.sum);

				return { value: tiers };
			},
		});
		this.setStats(displays);
	}
}
