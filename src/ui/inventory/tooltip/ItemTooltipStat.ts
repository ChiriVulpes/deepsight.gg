import type { DestinyStatDefinition } from "bungie-api-ts/destiny2";
import type { IStat, Item } from "model/models/Items";
import Manifest from "model/models/Manifest";
import { Classes } from "ui/Classes";
import Component from "ui/Component";

export enum Stat {
	// armour
	Mobility = 2996146975,
	Resilience = 392767087,
	Recovery = 1943323491,
	Discipline = 1735777505,
	Intellect = 144602215,
	Strength = 4244567218,
	// custom
	Total = -1,
	Distribution = -2,
}

const armourStats = [Stat.Mobility, Stat.Resilience, Stat.Recovery, Stat.Discipline, Stat.Intellect, Stat.Strength];

interface IStatDisplayCalculator {
	(item: Item, stat?: IStat): Omit<IStat, "definition"> | undefined;
}

interface IStatDisplayDefinition {
	name?: string;
	bar?: { max: number };
	calculate?: IStatDisplayCalculator;
	plus?: true;
}

const armourStatMax = 30;
const statDisplays: Record<Stat, IStatDisplayDefinition> = {
	[Stat.Mobility]: { plus: true, bar: { max: armourStatMax } },
	[Stat.Resilience]: { plus: true, bar: { max: armourStatMax } },
	[Stat.Recovery]: { plus: true, bar: { max: armourStatMax } },
	[Stat.Discipline]: { plus: true, bar: { max: armourStatMax } },
	[Stat.Intellect]: { plus: true, bar: { max: armourStatMax } },
	[Stat.Strength]: { plus: true, bar: { max: armourStatMax } },
	[Stat.Total]: {
		name: "Total",
		calculate: item => {
			const total = armourStats.map(stat => item.stats?.[stat]?.value ?? 0)
				.reduce((a, b) => a + b, 0);
			if (total === 0)
				return undefined; // this item doesn't have armour stats

			return {
				value: total,
			};
		},
	},
	[Stat.Distribution]: {
		name: "Distribution",
		calculate: item => undefined,
	},
};

export enum ItemTooltipStatClasses {
	Wrapper = "item-tooltip-stat-wrapper",
	Main = "item-tooltip-stat",
	Label = "item-tooltip-stat-label",
	Bar = "item-tooltip-stat-bar",
	BarBlock = "item-tooltip-stat-bar-block",
	Value = "item-tooltip-stat-value",
	ValueComponent = "item-tooltip-stat-value-component",
	Combined = "item-tooltip-stat-combined",
	Intrinsic = "item-tooltip-stat-intrinsic",
	Masterwork = "item-tooltip-stat-masterwork",
	Mod = "item-tooltip-stat-mod",
}

class ItemTooltipStat extends Component<HTMLElement, [Stat]> {

	public stat!: Stat;
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

	protected override async onMake (stat: Stat) {
		this.stat = stat;
		this.classes.add(ItemTooltipStatClasses.Main);

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
			.appendTo(this);
	}

	public setItem (item: Item) {
		const stat = item.stats?.[this.stat];
		if (this.display.calculate)
			return this.setDisplay(this.display.calculate(item, stat));

		return this.setDisplay(stat);
	}

	private setDisplay (display?: Omit<IStat, "definition">) {
		if (!display) {
			this.classes.add(Classes.Hidden);
			return false;
		}

		this.classes.remove(Classes.Hidden);

		if (display.intrinsic === undefined && display.masterwork === undefined && display.mod === undefined) {
			const render = this.render(display.value, true);
			this.combinedText.text.set(render?.text);
			this.intrinsicText.text.set(render?.text);
			if (this.display.bar)
				this.intrinsicBar!.style.set("--value", `${(render?.value ?? 0) / this.display.bar.max}`);
			return true;
		}

		let render = this.render((display.intrinsic ?? 0) + (display.masterwork ?? 0) + (display.mod ?? 0), true);
		this.combinedText.text.set(render?.text);

		render = this.render(display.intrinsic, true);
		this.intrinsicText.text.set(render?.text);
		if (this.display.bar)
			this.intrinsicBar!.style.set("--value", `${(render?.value ?? 0) / this.display.bar.max}`);

		render = this.render(display.masterwork, !render);
		this.masterworkText.text.set(render?.text);
		if (this.display.bar)
			this.masterworkBar!.style.set("--value", `${(render?.value ?? 0) / this.display.bar.max}`);

		render = this.render(display.mod, !render);
		this.modText.text.set(render?.text);
		if (this.display.bar)
			this.modBar!.style.set("--value", `${(render?.value ?? 0) / this.display.bar.max}`);

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
		public map!: Record<Stat, ItemTooltipStat>;

		protected override onMake (): void {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			this.map = {} as any;

			this.classes.add(ItemTooltipStatClasses.Wrapper)
				.append(...armourStats.map(stat => this.map[stat] = ItemTooltipStat.create([stat])))
				.append(this.map[Stat.Total] = ItemTooltipStat.create([Stat.Total]))
				.append(this.map[Stat.Distribution] = ItemTooltipStat.create([Stat.Distribution]));
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
