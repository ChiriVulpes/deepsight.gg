import type { Item } from "model/models/Items";
import Manifest from "model/models/Manifest";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import RangeInput from "ui/form/RangeInput";
import Sort, { ISort } from "ui/inventory/sort/Sort";
import { Stat } from "ui/inventory/tooltip/ItemTooltipStat";
import { EventManager } from "utility/EventManager";
import Store from "utility/Store";

export const STAT_GROUPS: [Stat, Stat, Stat][] = [
	[Stat.Mobility, Stat.Resilience, Stat.Recovery],
	[Stat.Discipline, Stat.Intellect, Stat.Strength],
];

export const STAT_MIN = 2;
export const STAT_MAX = 30;
export const STATS_MAX = 34;

export enum StatDistributionClasses {
	Main = "stat-distribution-configuration",
	Row = "stat-distribution-stat",
	Label = "stat-distribution-stat-label",
	Range = "stat-distribution-stat-range",
	Value = "stat-distribution-stat-value",
}

export interface IStatRowEvents extends ComponentEvents<typeof Component> {
	update: { value: number; oldValue: number };
}

class StatRow extends Component<HTMLElement, [Stat]> {

	public override event!: ComponentEventManager<this, IStatRowEvents>;

	public stat!: Stat;
	public input!: RangeInput;
	public valueText!: Component;

	public get value () {
		return this.input.value;
	}
	public set value (value: number) {
		this.input.value = value;
		this.update();
	}

	private oldValue!: number;

	protected override async onMake (stat: Stat) {
		this.stat = stat;
		this.classes.add(StatDistributionClasses.Row);

		const label = Component.create()
			.classes.add(StatDistributionClasses.Label)
			.appendTo(this);

		this.update = this.update.bind(this);
		this.input = RangeInput.create([{ min: STAT_MIN, max: STAT_MAX }])
			.classes.add(StatDistributionClasses.Range)
			.style.set("--visual-min", `${STAT_MIN / STAT_MAX}`)
			.event.subscribe("input", this.update)
			.appendTo(this);

		this.valueText = Component.create()
			.classes.add(StatDistributionClasses.Value)
			.appendTo(this);

		const preferredValue = Store.get<number>(`preferredStatDistribution.${Stat[stat]}`);
		this.value = preferredValue ?? STAT_MIN;

		this.update();

		const { DestinyStatDefinition } = await Manifest.await();
		const definition = await DestinyStatDefinition.get(stat);
		label.text.set(definition?.displayProperties.name ?? "Unknown")
	}

	public update (event?: any, force = false) {
		if (this.oldValue === this.input.value && !force)
			return this;

		this.valueText.text.set(`${this.input.value}`);

		const oldValue = this.oldValue;
		this.oldValue = this.input.value;
		Store.set(`preferredStatDistribution.${Stat[this.stat]}`, this.input.value);

		if (event || force)
			this.event.emit("update", { value: this.input.value, oldValue });

		return this;
	}
}

interface IStatDistributionDisplayEvents {
	update: Event;
}

const displayEvents = EventManager.make<IStatDistributionDisplayEvents>();

enum StatDistributionDisplayClasses {
	Main = "item-stat-distribution",
}

class StatDistributionDisplay extends Component<HTMLElement, [Item]> {

	public item!: Item;
	private contained = false;

	protected override onMake (item: Item): void {
		this.item = item;
		this.classes.add(StatDistributionDisplayClasses.Main);

		this.update = this.update.bind(this);
		displayEvents.subscribe("update", this.update);
		this.update();
	}

	public update () {
		if (!document.contains(this.element) && this.contained) {
			displayEvents.unsubscribe("update", this.update);
			return;
		}

		this.contained = true;

		const distribution = getStatDistribution(this.item);
		this.style.set("--value", `${distribution}`)
			.text.set(`${Math.floor(distribution * 100)}%`)
	}
}

function getStatDistribution (item: Item) {
	return 0;
}

export default ISort.create({
	id: Sort.StatDistribution,
	name: "Stat Distribution",
	shortName: "Stats",
	renderSortableOptions: wrapper => {
		const configuration = Component.create()
			.classes.add(StatDistributionClasses.Main)
			.appendTo(wrapper);

		for (const group of STAT_GROUPS) {
			const statRows = {} as Record<Stat, StatRow>;
			for (const stat of group) {
				statRows[stat] = StatRow.create([stat])
					.event.subscribe("update", event => {
						let difference = event.value - event.oldValue;
						const modificationOrder = group.map(stat => statRows[stat]).sort((a, b) => b.value - a.value);
						let i = 0;
						for (const otherRow of modificationOrder) {
							if (otherRow.stat === stat)
								continue;

							const oldValue = otherRow.value;
							otherRow.value -= i++ === 0 ? Math.ceil(difference / 2) : difference;
							difference += otherRow.value - oldValue;
						}

						// ensure stats are the right amount
						const total = modificationOrder.reduce((previous, current) => previous + current.value, 0);
						if (total !== STATS_MAX) {
							let difference = STATS_MAX - total;
							for (const otherRow of modificationOrder) {
								if (otherRow.stat === stat)
									continue;

								const oldValue = otherRow.value;
								otherRow.value += i++ === 0 ? Math.ceil(difference / 2) : difference;
								difference -= otherRow.value - oldValue;
							}
						}

						displayEvents.emit("update");
					})
					.appendTo(configuration);
			}

			for (const stat of group)
				statRows[stat].update(true, true);
		}
	},
	sort: (a, b) => getStatDistribution(b) - getStatDistribution(a),
	render: item => StatDistributionDisplay.create([item]),
});
