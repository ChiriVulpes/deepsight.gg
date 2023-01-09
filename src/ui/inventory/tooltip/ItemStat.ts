import { DestinyItemSubType } from "bungie-api-ts/destiny2";
import type Item from "model/models/items/Item";
import type { IStat } from "model/models/items/Stats";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import type { StatOrder } from "ui/inventory/Stat";
import { ARMOUR_STAT_GROUPS, ARMOUR_STAT_MAX, IStatDistribution, Stat } from "ui/inventory/Stat";
import RecoilDirection from "ui/inventory/tooltip/stats/RecoilDirection";
import type { GetterOfOr } from "utility/Type";

enum CustomStat {
	Total = -1,
	Distribution = -2,
}

interface ICustomStatDisplayDefinition extends Partial<IStat> {
	hash: number;
	order: StatOrder;
	name?: string;
	min?: number;
	max?: number;
	bar?: boolean;
	plus?: true;
	displayEntireFormula?: true;
	combinedValue?: number;
	combinedText?: string;
	calculate?(item: Item, stat: ICustomStatDisplayDefinition): Omit<ICustomStatDisplayDefinition, "calculate" | "definition" | "order" | "hash"> | undefined;
	renderFormula?(item: Item, stat: ICustomStatDisplayDefinition): Component[];
	renderBar?(bar: Component, item: Item, value: number): any;
}

export enum ItemStatClasses {
	Wrapper = "item-stat-wrapper",
	Main = "item-stat",
	Label = "item-stat-label",
	Bar = "item-stat-bar",
	BarBlock = "item-stat-bar-block",
	BarBlockNegative = "item-stat-bar-block-negative",
	Value = "item-stat-value",
	ValueComponent = "item-stat-value-component",
	ValueComponentNegative = "item-stat-value-component-negative",
	Combined = "item-stat-combined",
	Intrinsic = "item-stat-intrinsic",
	Masterwork = "item-stat-masterwork",
	Mod = "item-stat-mod",
	Formula = "item-stat-formula",
	Distribution = "item-stat-distribution-component",
}

const customStats: Record<CustomStat, ICustomStatDisplayDefinition> = {
	[CustomStat.Total]: {
		hash: CustomStat.Total,
		order: 1000,
		name: "Total",
		calculate: item => {
			const armourStats = ARMOUR_STAT_GROUPS.flat();
			const totalIntrinsic = armourStats.map(stat => item.stats?.values[stat]?.intrinsic ?? 0)
				.reduce((a, b) => a + b, 0);
			const totalMasterwork = armourStats.map(stat => item.stats?.values[stat]?.masterwork ?? 0)
				.reduce((a, b) => a + b, 0);
			const totalMod = armourStats.map(stat => item.stats?.values[stat]?.mod ?? 0)
				.reduce((a, b) => a + b, 0);
			if (totalIntrinsic + totalMasterwork + totalMod === 0)
				return undefined; // this item doesn't have armour stats

			return {
				value: totalIntrinsic + totalMasterwork + totalMod,
				intrinsic: totalIntrinsic,
				masterwork: totalMasterwork,
				mod: totalMod,
			};
		},
	},
	[CustomStat.Distribution]: {
		hash: CustomStat.Distribution,
		order: 1001,
		name: "Distribution",
		calculate: item => {
			const distribution = IStatDistribution.get(item);
			if (!distribution.overall)
				return undefined; // this item doesn't have armour stats

			return {
				value: distribution.overall,
				combinedValue: distribution.overall,
				combinedText: `${Math.floor(distribution.overall * 100)}%`,
				renderFormula: () => distribution.groups.map(groupValue => Component.create()
					.classes.add(ItemStatClasses.Distribution)
					.text.set(`${Math.floor(groupValue * 100)}%`)
					.style.set("--value", `${groupValue}`)),
			};
		},
	},
};

type StatDisplayDef = GetterOfOr<Partial<ICustomStatDisplayDefinition> | false, [Item, ICustomStatDisplayDefinition]>;
const customStatDisplays: Record<CustomStat, StatDisplayDef> & Partial<Record<Stat, StatDisplayDef>> = {
	// undrendered
	[Stat.Attack]: false,
	[Stat.Defense]: false,
	[Stat.Power]: false,
	[Stat.InventorySize]: false,
	[Stat.Mystery1]: false,
	[Stat.Mystery2]: false,
	// // weapons
	[Stat.AirborneEffectiveness]: item => item.definition.itemSubType === DestinyItemSubType.Sword ? false : { name: "Airborne Aim" },
	[Stat.RPM]: { name: "RPM", max: undefined },
	[Stat.DrawTime]: { max: undefined },
	[Stat.ChargeTime]: item => item.definition.itemSubType === DestinyItemSubType.Bow || item.definition.itemSubType === DestinyItemSubType.Sword ? false
		: { bar: true },
	[Stat.RecoilDirection]: {
		bar: true,
		renderBar: (bar, item, stat) => bar.removeContents()
			.append(RecoilDirection(stat)),
	},
	[Stat.Magazine]: item => item.definition.itemSubType === DestinyItemSubType.Sword ? false : {},
	[Stat.Zoom]: item => item.definition.itemSubType === DestinyItemSubType.Sword ? false : {},
	[Stat.Stability]: item => item.definition.itemSubType === DestinyItemSubType.Sword ? false : {},
	[Stat.Range]: item => item.definition.itemSubType === DestinyItemSubType.Sword ? false : {},
	// armour
	[Stat.Mobility]: { plus: true, max: ARMOUR_STAT_MAX, displayEntireFormula: true },
	[Stat.Resilience]: { plus: true, max: ARMOUR_STAT_MAX, displayEntireFormula: true },
	[Stat.Recovery]: { plus: true, max: ARMOUR_STAT_MAX, displayEntireFormula: true },
	[Stat.Discipline]: { plus: true, max: ARMOUR_STAT_MAX, displayEntireFormula: true },
	[Stat.Intellect]: { plus: true, max: ARMOUR_STAT_MAX, displayEntireFormula: true },
	[Stat.Strength]: { plus: true, max: ARMOUR_STAT_MAX, displayEntireFormula: true },
	...customStats,
};

class ItemStat extends Component<HTMLElement, [ICustomStatDisplayDefinition]> {

	public stat!: ICustomStatDisplayDefinition;
	public label!: Component;
	public bar?: Component;
	public intrinsicBar?: Component;
	public masterworkBar?: Component;
	public modBar?: Component;
	public combinedText!: Component;
	public intrinsicText!: Component;
	public masterworkText!: Component;
	public modText!: Component;
	public formulaText!: Component;

	protected override onMake (stat: ICustomStatDisplayDefinition) {
		this.stat = stat;

		const statName = Stat[this.stat.hash]
			?? CustomStat[this.stat.hash]
			?? this.stat.name
			?? this.stat.definition?.displayProperties.name.replace(/\s+/g, "")
			?? `${this.stat.hash}`;

		this.label = Component.create()
			.classes.add(ItemStatClasses.Label)
			.appendTo(this);

		if (this.stat?.bar)
			this.bar = Component.create()
				.classes.add(ItemStatClasses.Bar, `${ItemStatClasses.Bar}-${(statName).toLowerCase()}`)
				.append(this.intrinsicBar = Component.create()
					.classes.add(ItemStatClasses.BarBlock, ItemStatClasses.Intrinsic))
				.append(this.masterworkBar = Component.create()
					.classes.add(ItemStatClasses.BarBlock, ItemStatClasses.Masterwork))
				.append(this.modBar = Component.create()
					.classes.add(ItemStatClasses.BarBlock, ItemStatClasses.Mod))
				.appendTo(this);

		Component.create()
			.classes.add(ItemStatClasses.Value)
			.append(this.combinedText = Component.create()
				.classes.add(ItemStatClasses.Combined))
			.append(this.intrinsicText = Component.create()
				.classes.add(ItemStatClasses.ValueComponent, ItemStatClasses.Intrinsic))
			.append(this.masterworkText = Component.create()
				.classes.add(ItemStatClasses.ValueComponent, ItemStatClasses.Masterwork))
			.append(this.modText = Component.create()
				.classes.add(ItemStatClasses.ValueComponent, ItemStatClasses.Mod))
			.append(this.formulaText = Component.create()
				.classes.add(ItemStatClasses.ValueComponent, ItemStatClasses.Formula))
			.appendTo(this);

		this.classes.add(ItemStatClasses.Main, `${ItemStatClasses.Main}-${(statName).toLowerCase()}`);

		this.label.text.set(this.stat?.name ?? this.stat.definition?.displayProperties.name ?? "Unknown Stat");

		const icon = this.stat.definition?.displayProperties.icon;
		if (icon)
			this.label.style.set("--icon", `url("${icon}")`);
	}

	public set (display: ICustomStatDisplayDefinition, item: Item) {
		this.stat = display;

		if (display?.calculate) {
			const calculatedDisplay = display.calculate(item, display);
			if (!calculatedDisplay) {
				this.classes.add(Classes.Hidden);
				return false;
			}

			display = { ...display, ...calculatedDisplay };
		}

		this.classes.remove(Classes.Hidden);

		if (display.intrinsic === undefined && display.masterwork === undefined && display.mod === undefined && display.renderFormula === undefined) {
			const render = this.render(display, display.value, true);
			this.combinedText.text.set(display.combinedText ?? render?.text);
			this.intrinsicText.text.set(render?.text);
			if (display.bar && display.max) {
				const value = (render?.value ?? 0) / display.max;
				this.intrinsicBar!.style.set("--value", `${value}`)
					.classes.toggle((render?.value ?? 0) < 0, ItemStatClasses.BarBlockNegative);
				this.bar!.style.set("--value", `${value}`);
			}
			return true;
		}

		let combinedValue = undefined;
		if (combinedValue === undefined) {
			combinedValue = display.combinedValue ?? (display.intrinsic ?? 0) + (display.masterwork ?? 0) + (display.mod ?? 0);
			if (combinedValue < (display.min ?? -Infinity))
				combinedValue = display.min!;

			if (combinedValue > (display.max ?? Infinity))
				combinedValue = display.max!;
		}

		let render = this.render(display, combinedValue, true);
		this.combinedText.style.set("--value", `${render?.value ?? 0}`)
			.text.set(display.combinedText ?? render?.text);

		if (display.bar && display.max) {
			this.bar!.style.set("--value", `${(render?.value ?? 0) / display.max}`)
				.tweak(display.renderBar, item, render?.value ?? 0);
		}

		render = this.render(display, display.intrinsic, true);
		this.intrinsicText.text.set(render?.text);
		if (display.bar && display.max)
			this.intrinsicBar!.style.set("--value", `${(render?.value ?? 0) / display.max}`);

		render = this.render(display, display.masterwork, !render);
		this.masterworkText.text.set(render?.text)
			.classes.toggle(!render?.value && !display.displayEntireFormula, Classes.Hidden);
		if (display.bar && display.max)
			this.masterworkBar!.style.set("--value", `${(render?.value ?? 0) / display.max}`);

		render = this.render(display, display.mod, !render);
		this.modText.text.set(render?.text)
			.classes.toggle((render?.value ?? 0) < 0, ItemStatClasses.ValueComponentNegative)
			.classes.toggle(!render?.value && !display.displayEntireFormula, Classes.Hidden);
		if (display.bar && display.max)
			this.modBar!.style.set("--value", `${(render?.value ?? 0) / display.max}`)
				.classes.toggle((render?.value ?? 0) < 0, ItemStatClasses.BarBlockNegative);

		this.formulaText.classes.toggle(!display.renderFormula, Classes.Hidden)
			.removeContents()
			.append(...display.renderFormula?.(item, display) ?? []);

		return true;
	}

	private render (display: ICustomStatDisplayDefinition, value: number | undefined, first: boolean): { text: string; value: number } | undefined {
		if (value === undefined)
			return undefined;

		return {
			value,
			text: (!first || display.plus) && value >= 0 ? `+${value}` : `${value}`,
		};
	}
}

namespace ItemStat {
	export class Wrapper extends Component {
		public map!: Record<number, ItemStat>;

		protected override onMake (): void {
			this.map = {};

			this.classes.add(ItemStatClasses.Wrapper)
		}

		public setItem (item: Item) {
			let hasAnyVisible = false;
			const stats = (Object.values(item.stats?.values ?? {}) as ICustomStatDisplayDefinition[])
				.concat(Object.values(customStats));

			while (true) {
				let sorted = false;
				NextStat: for (const stat of stats) {
					if (typeof stat.order !== "number") {
						const searchHash = stat.order.after ?? stat.order.before;
						for (const pivotStat of stats) {
							if (pivotStat.hash === searchHash) {
								if (typeof pivotStat.order !== "number")
									// can't pivot on this stat yet, it doesn't have its own order fixed
									continue NextStat;

								stat.order = pivotStat.order + 0.01;
								sorted = true;
							}
						}
					}
				}

				if (!sorted)
					break;
			}

			stats.sort((a, b) => (a.order as number) - (b.order as number));

			const statDisplays: Record<number, ICustomStatDisplayDefinition | undefined> = {};
			for (const stat of stats) {
				let custom = customStatDisplays[stat.hash as Stat];
				if (typeof custom === "function")
					custom = custom(item, stat);

				if (custom === false)
					continue;

				const display = {
					...stat,
					...custom,
				};
				const component = (this.map[stat.hash] ??= ItemStat.create([display])).appendTo(this);
				const isVisible = component.set(display, item);
				hasAnyVisible ||= isVisible;
				if (isVisible)
					statDisplays[stat.hash] = display;
			}

			for (const stat of Object.keys(this.map))
				this.map[+stat].classes.toggle(!statDisplays[+stat], Classes.Hidden);

			this.classes.toggle(!hasAnyVisible, Classes.Hidden);
		}
	}
}

export default ItemStat;
