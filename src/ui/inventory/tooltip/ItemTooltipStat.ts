import type { DestinyStatDefinition } from "bungie-api-ts/destiny2";
import type { IStat, Item } from "model/models/Items";
import Manifest from "model/models/Manifest";
import { Classes } from "ui/Classes";
import type { AnyComponent } from "ui/Component";
import Component from "ui/Component";
import { ARMOUR_STAT_GROUPS, ARMOUR_STAT_MAX, IStatDistribution, Stat } from "ui/inventory/Stat";

enum CustomStat {
	Total = -1,
	Distribution = -2,
}

interface IDisplayStat extends Omit<IStat, "definition"> {
	combinedValue?: number;
	combinedText?: string;
	renderFormula?(): AnyComponent[];
}

interface IStatDisplayCalculator {
	(item: Item, stat?: IStat): IDisplayStat | undefined;
}

interface IStatDisplayDefinition {
	name?: string;
	bar?: { max: number };
	calculate?: IStatDisplayCalculator;
	plus?: true;
}

export enum ItemTooltipStatClasses {
	Wrapper = "item-tooltip-stat-wrapper",
	Main = "item-tooltip-stat",
	Label = "item-tooltip-stat-label",
	Bar = "item-tooltip-stat-bar",
	BarBlock = "item-tooltip-stat-bar-block",
	BarBlockNegative = "item-tooltip-stat-bar-block-negative",
	Value = "item-tooltip-stat-value",
	ValueComponent = "item-tooltip-stat-value-component",
	ValueComponentNegative = "item-tooltip-stat-value-component-negative",
	Combined = "item-tooltip-stat-combined",
	Intrinsic = "item-tooltip-stat-intrinsic",
	Masterwork = "item-tooltip-stat-masterwork",
	Mod = "item-tooltip-stat-mod",
	Formula = "item-tooltip-stat-formula",
	Distribution = "item-tooltip-stat-distribution-component",
}

const statDisplays: Record<Stat | CustomStat, IStatDisplayDefinition> = {
	[Stat.Mobility]: { plus: true, bar: { max: ARMOUR_STAT_MAX } },
	[Stat.Resilience]: { plus: true, bar: { max: ARMOUR_STAT_MAX } },
	[Stat.Recovery]: { plus: true, bar: { max: ARMOUR_STAT_MAX } },
	[Stat.Discipline]: { plus: true, bar: { max: ARMOUR_STAT_MAX } },
	[Stat.Intellect]: { plus: true, bar: { max: ARMOUR_STAT_MAX } },
	[Stat.Strength]: { plus: true, bar: { max: ARMOUR_STAT_MAX } },
	[CustomStat.Total]: {
		name: "Total",
		calculate: item => {
			const armourStats = ARMOUR_STAT_GROUPS.flat();
			const totalIntrinsic = armourStats.map(stat => item.stats?.[stat]?.intrinsic ?? 0)
				.reduce((a, b) => a + b, 0);
			const totalMasterwork = armourStats.map(stat => item.stats?.[stat]?.masterwork ?? 0)
				.reduce((a, b) => a + b, 0);
			const totalMod = armourStats.map(stat => item.stats?.[stat]?.mod ?? 0)
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
		name: "Distribution",
		calculate: item => {
			const distribution = IStatDistribution.get(item);
			return {
				value: distribution.overall,
				combinedValue: distribution.overall,
				combinedText: `${Math.floor(distribution.overall * 100)}%`,
				renderFormula: () => distribution.groups.map(groupValue => Component.create()
					.classes.add(ItemTooltipStatClasses.Distribution)
					.text.set(`${Math.floor(groupValue * 100)}%`)
					.style.set("--value", `${groupValue}`)),
			};
		},
	},
};

class ItemTooltipStat extends Component<HTMLElement, [Stat | CustomStat]> {

	public stat!: Stat | CustomStat;
	public display!: IStatDisplayDefinition;
	public definition?: DestinyStatDefinition;
	public bar?: Component;
	public intrinsicBar?: Component;
	public masterworkBar?: Component;
	public modBar?: Component;
	public combinedText!: Component;
	public intrinsicText!: Component;
	public masterworkText!: Component;
	public modText!: Component;
	public formulaText!: Component;

	protected override async onMake (stat: Stat | CustomStat) {
		this.stat = stat;
		this.classes.add(ItemTooltipStatClasses.Main, `${ItemTooltipStatClasses.Main}-${(Stat[stat] ?? CustomStat[stat]).toLowerCase()}`);

		this.display = statDisplays[stat];
		const { DestinyStatDefinition } = await Manifest.await();

		this.definition = await DestinyStatDefinition.get(stat);
		const label = Component.create()
			.classes.add(ItemTooltipStatClasses.Label)
			.text.set(this.display.name ?? this.definition?.displayProperties.name ?? "Unknown Stat")
			.appendTo(this);

		const icon = this.definition?.displayProperties.icon;
		if (icon)
			label.style.set("--icon", `url("${icon}")`);

		if (this.display.bar)
			this.bar = Component.create()
				.classes.add(ItemTooltipStatClasses.Bar)
				.append(this.intrinsicBar = Component.create()
					.classes.add(ItemTooltipStatClasses.BarBlock, ItemTooltipStatClasses.Intrinsic))
				.append(this.masterworkBar = Component.create()
					.classes.add(ItemTooltipStatClasses.BarBlock, ItemTooltipStatClasses.Masterwork))
				.append(this.modBar = Component.create()
					.classes.add(ItemTooltipStatClasses.BarBlock, ItemTooltipStatClasses.Mod))
				.appendTo(this);

		Component.create()
			.classes.add(ItemTooltipStatClasses.Value)
			.append(this.combinedText = Component.create()
				.classes.add(ItemTooltipStatClasses.Combined))
			.append(this.intrinsicText = Component.create()
				.classes.add(ItemTooltipStatClasses.ValueComponent, ItemTooltipStatClasses.Intrinsic))
			.append(this.masterworkText = Component.create()
				.classes.add(ItemTooltipStatClasses.ValueComponent, ItemTooltipStatClasses.Masterwork))
			.append(this.modText = Component.create()
				.classes.add(ItemTooltipStatClasses.ValueComponent, ItemTooltipStatClasses.Mod))
			.append(this.formulaText = Component.create()
				.classes.add(ItemTooltipStatClasses.ValueComponent, ItemTooltipStatClasses.Formula))
			.appendTo(this);
	}

	public setItem (item: Item) {
		const stat = item.stats?.[this.stat];
		if (this.display.calculate)
			return this.setDisplay(this.display.calculate(item, stat));

		return this.setDisplay(stat);
	}

	private setDisplay (display?: IDisplayStat) {
		if (!display) {
			this.classes.add(Classes.Hidden);
			return false;
		}

		this.classes.remove(Classes.Hidden);

		if (display.intrinsic === undefined && display.masterwork === undefined && display.mod === undefined && display.renderFormula === undefined) {
			const render = this.render(display.value, true);
			this.combinedText.text.set(display.combinedText ?? render?.text);
			this.intrinsicText.text.set(render?.text);
			if (this.display.bar)
				this.intrinsicBar!.style.set("--value", `${(render?.value ?? 0) / this.display.bar.max}`)
					.classes.toggle((render?.value ?? 0) < 0, ItemTooltipStatClasses.BarBlockNegative);
			return true;
		}

		let render = this.render(display.combinedValue ?? (display.intrinsic ?? 0) + (display.masterwork ?? 0) + (display.mod ?? 0), true);
		this.combinedText.style.set("--value", `${render?.value ?? 0}`)
			.text.set(display.combinedText ?? render?.text);

		render = this.render(display.intrinsic, true);
		this.intrinsicText.text.set(render?.text);
		if (this.display.bar)
			this.intrinsicBar!.style.set("--value", `${(render?.value ?? 0) / this.display.bar.max}`);

		render = this.render(display.masterwork, !render);
		this.masterworkText.text.set(render?.text);
		if (this.display.bar)
			this.masterworkBar!.style.set("--value", `${(render?.value ?? 0) / this.display.bar.max}`);

		render = this.render(display.mod, !render);
		this.modText.text.set(render?.text)
			.classes.toggle((render?.value ?? 0) < 0, ItemTooltipStatClasses.ValueComponentNegative);
		if (this.display.bar)
			this.modBar!.style.set("--value", `${(render?.value ?? 0) / this.display.bar.max}`)
				.classes.toggle((render?.value ?? 0) < 0, ItemTooltipStatClasses.BarBlockNegative);

		this.formulaText.classes.toggle(!display.renderFormula, Classes.Hidden)
			.removeContents()
			.append(...display.renderFormula?.() ?? []);

		return true;
	}

	private render (value: number | undefined, first: boolean): { text: string; value: number } | undefined {
		if (value === undefined)
			return undefined;

		return {
			value,
			text: (!first || this.display.plus) && value >= 0 ? `+${value}` : `${value}`,
		};
	}
}

namespace ItemTooltipStat {
	export class Wrapper extends Component {
		public map!: Record<Stat | CustomStat, ItemTooltipStat>;

		protected override onMake (): void {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			this.map = {} as any;

			this.classes.add(ItemTooltipStatClasses.Wrapper)
				.append(...ARMOUR_STAT_GROUPS.flat().map(stat => this.map[stat] = ItemTooltipStat.create([stat])))
				.append(this.map[CustomStat.Total] = ItemTooltipStat.create([CustomStat.Total]))
				.append(this.map[CustomStat.Distribution] = ItemTooltipStat.create([CustomStat.Distribution]));
		}

		public setItem (item: Item) {
			const hasVisibleStats = Object.values(this.map)
				.map(component => component.setItem(item))
				.some(statVisible => statVisible);

			this.classes.toggle(!hasVisibleStats, Classes.Hidden);
		}
	}
}

export default ItemTooltipStat;
